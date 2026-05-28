from django.db import transaction
from django.shortcuts import get_object_or_404, render, redirect
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib import messages
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.utils import timezone
from django.utils.dateparse import parse_date
from .models import (
    AdoptionPet,
    AdoptionApplication,
    Appointment,
    Order,
    OrderItem,
    Pet,
    Product,
    ServiceReservation,
    UserProfile,
)
import json


def is_valid_email(email):
    try:
        validate_email(email)
        return True
    except ValidationError:
        return False


def render_with_auth_error(request, template_name, error_key, message, extra_context=None):
    context = extra_context or {}
    context[error_key] = message
    return render(request, template_name, context)


# 🔹 HOME
def home(request):
    return render(request, 'app/index.html')


# 🔹 AUTENTICACIÓN
def login_view(request):
    if request.method == "POST":
        email = request.POST.get("email", "").strip().lower()
        password = request.POST.get("password", "")
        remember = request.POST.get("remember")

        if not email and not password:
            return render_with_auth_error(request, "app/login.html", "login_error", "Ingresa tu correo y contraseña para continuar.")

        if not email:
            return render_with_auth_error(request, "app/login.html", "login_error", "Ingresa tu correo electrónico.")

        if not is_valid_email(email):
            return render_with_auth_error(request, "app/login.html", "login_error", "Ingresa un correo electrónico válido.", {
                "prefill_email": email
            })

        if not password:
            return render_with_auth_error(request, "app/login.html", "login_error", "Ingresa tu contraseña.", {
                "prefill_email": email
            })

        if not User.objects.filter(username=email).exists() and not User.objects.filter(email=email).exists():
            return render_with_auth_error(request, "app/login.html", "login_error", "Este correo no está registrado. Crea una cuenta para continuar.", {
                "prefill_email": email
            })

        user = authenticate(request, username=email, password=password)

        if user is not None:
            login(request, user)
            if remember:
                request.session.set_expiry(60 * 60 * 24 * 30)
            else:
                request.session.set_expiry(0)
            next_url = request.GET.get("next")
            return redirect(next_url or "/perfil/")

        return render(request, "app/login.html", {
            "login_error": "La contraseña es incorrecta. Inténtalo nuevamente.",
            "prefill_email": email
        })

    return render(request, "app/login.html", {
        "prefill_email": request.GET.get("email", "").strip().lower()
    })


@login_required(login_url="/login/")
def perfil(request):
    pets_count = Pet.objects.filter(owner=request.user).count()
    appointments_count = Appointment.objects.filter(user=request.user).count()
    orders_count = Order.objects.filter(user=request.user).count()
    reservations_count = ServiceReservation.objects.filter(user=request.user).count()
    adoption_requests_count = (
        AdoptionPet.objects.filter(owner=request.user).count()
        + AdoptionApplication.objects.filter(applicant=request.user).count()
    )
    profile, created = UserProfile.objects.get_or_create(user=request.user)

    profile_items = [
        bool(request.user.first_name),
        bool(request.user.email),
        bool(profile.phone),
        bool(profile.city),
        bool(profile.address),
    ]
    profile_completion = round((sum(profile_items) / len(profile_items)) * 100)

    next_action = None
    if profile_completion < 100:
        next_action = {
            "label": "Completar perfil",
            "url": "/perfil/editar/",
            "description": "Agrega tus datos de contacto para compras, citas y servicios.",
        }
    elif pets_count == 0:
        next_action = {
            "label": "Registrar mascota",
            "url": "/mascotas/",
            "description": "Crea el perfil de tu mascota para agendar citas y reservas.",
        }
    elif appointments_count == 0:
        next_action = {
            "label": "Agendar cita",
            "url": "/citas/",
            "description": "Solicita una cita veterinaria para iniciar el seguimiento.",
        }
    else:
        next_action = {
            "label": "Ver tienda",
            "url": "/tienda/",
            "description": "Explora productos disponibles y revisa tus pedidos.",
        }

    recent_orders = Order.objects.filter(user=request.user).order_by("-created_at")[:3]
    recent_appointments = Appointment.objects.filter(user=request.user).select_related("pet").order_by("-created_at")[:3]

    return render(request, 'app/perfil.html', {
        "profile": profile,
        "pets_count": pets_count,
        "appointments_count": appointments_count,
        "orders_count": orders_count,
        "reservations_count": reservations_count,
        "adoption_requests_count": adoption_requests_count,
        "profile_completion": profile_completion,
        "next_action": next_action,
        "recent_orders": recent_orders,
        "recent_appointments": recent_appointments,
    })


@login_required(login_url="/login/")
def editar_perfil(request):
    profile, created = UserProfile.objects.get_or_create(user=request.user)

    if request.method == "POST":
        name = request.POST.get("name", "").strip()
        email = request.POST.get("email", "").strip().lower()

        if not name or not email:
            return render(request, "app/editar_perfil.html", {
                "profile": profile,
                "profile_error": "Nombre y correo son obligatorios."
            })

        phone = request.POST.get("phone", "").strip()
        phone_digits = "".join(char for char in phone if char.isdigit())
        if phone_digits != phone or len(phone_digits) < 7:
            return render(request, "app/editar_perfil.html", {
                "profile": profile,
                "profile_error": "Ingresa un número de teléfono válido, solo con números."
            })

        if not is_valid_email(email):
            return render(request, "app/editar_perfil.html", {
                "profile": profile,
                "profile_error": "Ingresa un correo electrónico válido."
            })

        duplicated_email = User.objects.filter(email=email).exclude(id=request.user.id).exists()
        duplicated_username = User.objects.filter(username=email).exclude(id=request.user.id).exists()
        if duplicated_email or duplicated_username:
            return render(request, "app/editar_perfil.html", {
                "profile": profile,
                "profile_error": "Este correo ya está registrado en otra cuenta."
            })

        request.user.first_name = name
        request.user.email = email
        request.user.username = email
        request.user.save()

        profile.phone = phone_digits
        profile.city = request.POST.get("city", "").strip()
        profile.address = request.POST.get("address", "").strip()
        profile.save()

        messages.success(request, "Perfil actualizado correctamente.")
        return redirect("perfil")

    return render(request, "app/editar_perfil.html", {
        "profile": profile
    })


def logout_view(request):
    logout(request)
    return redirect("/login/")


def registro(request):
    if request.method == "POST":
        name = request.POST.get("name", "").strip()
        email = request.POST.get("email", "").strip().lower()
        phone = request.POST.get("phone", "").strip()
        city = request.POST.get("city", "").strip()
        address = request.POST.get("address", "").strip()
        password = request.POST.get("password", "")
        confirm_password = request.POST.get("confirm_password", "")
        accept_terms = request.POST.get("accept_terms")

        if not name or not email or not phone or not city or not address or not password or not confirm_password:
            return render(request, "app/registro.html", {
                "register_error": "Completa todos los campos obligatorios."
            })

        phone_digits = "".join(char for char in phone if char.isdigit())
        if phone_digits != phone or len(phone_digits) < 7:
            return render(request, "app/registro.html", {
                "register_error": "Ingresa un número de teléfono válido, solo con números."
            })

        if not is_valid_email(email):
            return render(request, "app/registro.html", {
                "register_error": "Ingresa un correo electrónico válido."
            })

        if len(password) < 8 or not any(char.isupper() for char in password) or not any(char.islower() for char in password) or not any(char.isdigit() for char in password):
            return render(request, "app/registro.html", {
                "register_error": "La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número."
            })

        if password != confirm_password:
            return render(request, "app/registro.html", {
                "register_error": "Las contraseñas no coinciden. Verifica nuevamente para continuar."
            })

        if not accept_terms:
            return render(request, "app/registro.html", {
                "register_error": "Debes aceptar el tratamiento de datos para crear tu cuenta."
            })

        if User.objects.filter(email=email).exists() or User.objects.filter(username=email).exists():
            return render(request, "app/registro.html", {
                "register_error": "Ya existe una cuenta registrada con este correo. Puedes iniciar sesión."
            })

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=name
        )

        profile, created = UserProfile.objects.get_or_create(user=user)
        profile.phone = phone_digits
        profile.city = city
        profile.address = address
        profile.save()

        messages.success(request, "Cuenta creada correctamente. Ahora puedes iniciar sesión.")
        return redirect(f"/login/?email={email}")

    return render(request, "app/registro.html")


# 🔹 MÓDULOS
@login_required(login_url="/login/")
def mascotas(request):
    if request.method == "POST":
        pet_id = request.POST.get("pet_id")
        name = request.POST.get("name", "").strip()
        pet_type = request.POST.get("pet_type", "").strip()
        breed = request.POST.get("breed", "").strip()
        birth_date = request.POST.get("birth_date", "")
        vaccines = request.POST.get("vaccines", "").strip()
        status = request.POST.get("status", "").strip()
        notes = request.POST.get("notes", "").strip()

        if not name or not pet_type or not breed or not birth_date or not vaccines or not status:
            pets = Pet.objects.filter(owner=request.user).order_by("-created_at")
            return render(request, "app/mascotas.html", {
                "pets": pets,
                "pet_error": "Completa los datos principales de tu mascota."
            })

        birth_date_value = parse_date(birth_date)
        if not birth_date_value:
            pets = Pet.objects.filter(owner=request.user).order_by("-created_at")
            return render(request, "app/mascotas.html", {
                "pets": pets,
                "pet_error": "Selecciona una fecha de nacimiento válida."
            })

        if birth_date_value > timezone.localdate():
            pets = Pet.objects.filter(owner=request.user).order_by("-created_at")
            return render(request, "app/mascotas.html", {
                "pets": pets,
                "pet_error": "La fecha de nacimiento no puede ser futura."
            })

        if pet_id:
            pet = get_object_or_404(Pet, id=pet_id, owner=request.user)
            pet.name = name
            pet.pet_type = pet_type
            pet.breed = breed
            pet.birth_date = birth_date_value
            pet.vaccines = vaccines
            pet.status = status
            pet.notes = notes
            pet.save()
            messages.success(request, "Mascota actualizada correctamente.")
        else:
            Pet.objects.create(
                owner=request.user,
                name=name,
                pet_type=pet_type,
                breed=breed,
                birth_date=birth_date_value,
                vaccines=vaccines,
                status=status,
                notes=notes
            )
            messages.success(request, "Mascota registrada correctamente.")

        return redirect("mascotas")

    pets = Pet.objects.filter(owner=request.user).order_by("-created_at")
    return render(request, "app/mascotas.html", {
        "pets": pets
    })
    
@login_required(login_url="/login/")
def eliminar_mascota(request, pet_id):
    if request.method == "POST":
        pet = get_object_or_404(Pet, id=pet_id, owner=request.user)
        pet.delete()
        messages.success(request, "Mascota eliminada correctamente.")

    return redirect("mascotas")
    
    


@login_required(login_url="/login/")
def citas(request):
    pets = Pet.objects.filter(owner=request.user).order_by("name")
    appointments = Appointment.objects.filter(user=request.user).select_related("pet")
    return render(request, "app/citas.html", {
        "pets": pets,
        "appointments": appointments,
    })


def tienda(request):
    products = Product.objects.filter(is_active=True).order_by("-created_at")
    orders = []
    if request.user.is_authenticated:
        orders = Order.objects.filter(user=request.user).prefetch_related("items__product").order_by("-created_at")[:5]
    return render(request, "app/tienda.html", {
        "products": products,
        "orders": orders,
    })


@login_required(login_url="/login/")
def servicios(request):
    pets = Pet.objects.filter(owner=request.user).order_by("name")
    reservations = ServiceReservation.objects.filter(user=request.user).select_related("pet")
    return render(request, "app/servicios.html", {
        "pets": pets,
        "reservations": reservations,
    })


@login_required(login_url="/login/")
def crear_cita(request):
    if request.method != "POST":
        return JsonResponse({"message": "Método no permitido"}, status=405)

    pet = get_object_or_404(Pet, id=request.POST.get("pet_id"), owner=request.user)
    reason = request.POST.get("reason", "").strip()
    preferred_date = request.POST.get("date", "").strip()
    preferred_time = request.POST.get("time", "").strip()
    notes = request.POST.get("notes", "").strip()

    if not reason or not preferred_date or not preferred_time:
        return JsonResponse({"message": "Completa mascota, motivo, fecha y jornada."}, status=400)

    preferred_date_value = parse_date(preferred_date)
    if not preferred_date_value:
        return JsonResponse({"message": "Selecciona una fecha válida para la cita."}, status=400)

    if preferred_date_value < timezone.localdate():
        return JsonResponse({"message": "La cita no puede programarse en una fecha pasada."}, status=400)

    duplicated = Appointment.objects.filter(
        user=request.user,
        pet=pet,
        preferred_date=preferred_date_value,
        preferred_time=preferred_time,
        status__in=["pendiente", "confirmada"],
    ).exists()

    if duplicated:
        return JsonResponse({"message": "Ya tienes una cita para esa mascota en la misma fecha y jornada."}, status=400)

    appointment = Appointment.objects.create(
        user=request.user,
        pet=pet,
        reason=reason,
        preferred_date=preferred_date_value,
        preferred_time=preferred_time,
        notes=notes,
    )

    return JsonResponse({
        "message": "Cita solicitada correctamente.",
        "appointment": {
            "pet": appointment.pet.name,
            "reason": appointment.reason,
            "date": appointment.preferred_date.isoformat(),
            "time": appointment.preferred_time,
            "notes": appointment.notes,
            "status": appointment.get_status_display(),
        }
    })


@login_required(login_url="/login/")
def cancelar_cita(request, appointment_id):
    if request.method != "POST":
        return redirect("citas")

    appointment = get_object_or_404(Appointment, id=appointment_id, user=request.user)

    if appointment.status == "cancelada":
        messages.info(request, "Esta cita ya estaba cancelada.")
    else:
        appointment.status = "cancelada"
        appointment.save(update_fields=["status"])
        messages.success(request, "Cita cancelada correctamente.")

    next_url = request.POST.get("next") or "citas"
    return redirect(next_url)


@login_required(login_url="/login/")
def crear_reserva_servicio(request):
    if request.method != "POST":
        return JsonResponse({"message": "Método no permitido"}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"message": "Datos inválidos"}, status=400)

    pet = get_object_or_404(Pet, id=data.get("pet_id"), owner=request.user)
    service = (data.get("service") or "").strip()
    preferred_time = (data.get("time") or "").strip()
    walker = (data.get("walker") or "").strip()
    allowed_services = {"Baño", "Guardería", "Consulta a domicilio", "Paseo"}

    if not service or not preferred_time:
        return JsonResponse({"message": "Selecciona servicio, mascota y jornada."}, status=400)

    if service not in allowed_services:
        return JsonResponse({"message": "Selecciona un servicio válido."}, status=400)

    duplicated = ServiceReservation.objects.filter(
        user=request.user,
        pet=pet,
        service=service,
        preferred_time=preferred_time,
        status__in=["pendiente", "confirmada"],
    ).exists()

    if duplicated:
        return JsonResponse({"message": "Ya existe una reserva similar para esta mascota."}, status=400)

    reservation = ServiceReservation.objects.create(
        user=request.user,
        pet=pet,
        service=service,
        preferred_time=preferred_time,
        walker=walker,
    )

    return JsonResponse({
        "message": "Reserva confirmada correctamente.",
        "reservation": {
            "service": reservation.service,
            "pet": reservation.pet.name,
            "time": reservation.preferred_time,
            "walker": reservation.walker or "No aplica",
            "status": reservation.get_status_display(),
        }
    })


@login_required(login_url="/login/")
def crear_pedido(request):
    if request.method != "POST":
        return JsonResponse({"message": "Método no permitido"}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"message": "Datos inválidos"}, status=400)

    items = data.get("items", [])
    if not items:
        return JsonResponse({"message": "Agrega al menos un producto al carrito."}, status=400)

    with transaction.atomic():
        quantities_by_product = {}
        for item in items:
            try:
                product_id = int(item.get("id"))
                quantity = int(item.get("quantity", 0))
            except (TypeError, ValueError):
                return JsonResponse({"message": "Producto o cantidad inválida."}, status=400)

            if quantity <= 0:
                return JsonResponse({"message": "La cantidad debe ser mayor que cero."}, status=400)

            quantities_by_product[product_id] = quantities_by_product.get(product_id, 0) + quantity

        product_ids = list(quantities_by_product.keys())
        products = {
            product.id: product
            for product in Product.objects.select_for_update().filter(id__in=product_ids, is_active=True)
        }

        order_items = []
        total = 0

        for product_id, quantity in quantities_by_product.items():
            product = products.get(product_id)
            if not product:
                return JsonResponse({"message": "Uno de los productos no está disponible."}, status=400)

            if quantity > product.stock:
                return JsonResponse({
                    "message": f"No hay suficiente stock para {product.name}. Disponible: {product.stock}."
                }, status=400)

            order_items.append((product, quantity))
            total += product.price * quantity

        order = Order.objects.create(user=request.user, status="pendiente", total=total)

        for product, quantity in order_items:
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=product.price,
            )
            product.stock -= quantity
            product.save(update_fields=["stock"])

    return JsonResponse({
        "message": "Pedido recibido correctamente. Quedó pendiente de confirmación del administrador.",
        "order": {
            "id": order.id,
            "total": order.total,
            "status": order.get_status_display(),
        }
    })


@staff_member_required(login_url="/login/")
def gestion_api(request):
    return render(request, "app/gestion_api.html")


def adopciones(request):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return redirect("/login/?next=/adopciones/")

        name = request.POST.get("name", "").strip()
        pet_type = request.POST.get("pet_type", "").strip()
        age = request.POST.get("age", "").strip()
        size = request.POST.get("size", "").strip()
        city = request.POST.get("city", "").strip()
        description = request.POST.get("description", "").strip()
        requirements = request.POST.get("requirements", "").strip()
        contact_phone = request.POST.get("contact_phone", "").strip()
        photo = request.FILES.get("photo")

        if not name or not pet_type or not age or not size or not city or not description or not requirements or not contact_phone or not photo:
            approved_pets = AdoptionPet.objects.filter(status="aprobado").order_by("-created_at")
            my_requests = AdoptionPet.objects.filter(owner=request.user).order_by("-created_at")
            my_applications = AdoptionApplication.objects.filter(applicant=request.user).select_related("pet").order_by("-created_at")

            return render(request, "app/adopciones.html", {
                "approved_pets": approved_pets,
                "my_requests": my_requests,
                "my_applications": my_applications,
                "adoption_error": "Completa todos los campos para enviar la solicitud."
            })

        contact_phone_digits = "".join(char for char in contact_phone if char.isdigit())
        if contact_phone_digits != contact_phone or len(contact_phone_digits) < 7:
            approved_pets = AdoptionPet.objects.filter(status="aprobado").order_by("-created_at")
            my_requests = AdoptionPet.objects.filter(owner=request.user).order_by("-created_at")
            my_applications = AdoptionApplication.objects.filter(applicant=request.user).select_related("pet").order_by("-created_at")
            return render(request, "app/adopciones.html", {
                "approved_pets": approved_pets,
                "my_requests": my_requests,
                "my_applications": my_applications,
                "adoption_error": "Ingresa un teléfono de contacto válido, solo con números."
            })

        if not getattr(photo, "content_type", "").startswith("image/"):
            approved_pets = AdoptionPet.objects.filter(status="aprobado").order_by("-created_at")
            my_requests = AdoptionPet.objects.filter(owner=request.user).order_by("-created_at")
            my_applications = AdoptionApplication.objects.filter(applicant=request.user).select_related("pet").order_by("-created_at")
            return render(request, "app/adopciones.html", {
                "approved_pets": approved_pets,
                "my_requests": my_requests,
                "my_applications": my_applications,
                "adoption_error": "Selecciona una imagen válida para la mascota."
            })

        AdoptionPet.objects.create(
            owner=request.user,
            name=name,
            pet_type=pet_type,
            age=age,
            size=size,
            city=city,
            description=description,
            requirements=requirements,
            contact_phone=contact_phone_digits,
            photo=photo
        )

        messages.success(
            request,
            "Solicitud enviada correctamente. Quedó pendiente de revisión por el administrador."
        )

        return redirect("adopciones")

    approved_pets = AdoptionPet.objects.filter(status="aprobado").order_by("-created_at")
    my_requests = []
    my_applications = []

    if request.user.is_authenticated:
        my_requests = AdoptionPet.objects.filter(owner=request.user).order_by("-created_at")
        my_applications = AdoptionApplication.objects.filter(applicant=request.user).select_related("pet").order_by("-created_at")

    return render(request, "app/adopciones.html", {
        "approved_pets": approved_pets,
        "my_requests": my_requests,
        "my_applications": my_applications,
    })


@login_required(login_url="/login/")
def solicitar_adopcion(request, pet_id):
    if request.method != "POST":
        return redirect("adopciones")

    pet = get_object_or_404(AdoptionPet, id=pet_id, status="aprobado")

    if pet.owner == request.user:
        messages.error(request, "No puedes solicitar la adopción de una mascota que publicaste.")
        return redirect("adopciones")

    application, created = AdoptionApplication.objects.get_or_create(
        pet=pet,
        applicant=request.user,
        defaults={
            "message": request.POST.get("message", "").strip()
        }
    )

    if created:
        messages.success(request, "Solicitud de adopción enviada correctamente. Quedó pendiente de revisión.")
    else:
        messages.info(request, "Ya enviaste una solicitud para esta mascota. Puedes revisar su estado en tu historial.")

    return redirect("adopciones")


# 🔹 NEWSLETTER
def newsletter(request):
    if request.method != "POST":
        return JsonResponse({"message": "Método no permitido"}, status=405)

    try:
        data = json.loads(request.body)

        email = data.get("email", "").strip()
        pet = data.get("pet_type", "").strip()

        if not email:
            return JsonResponse({"message": "Debes ingresar un correo"}, status=400)

        if not is_valid_email(email):
            return JsonResponse({"message": "Correo inválido"}, status=400)

        return JsonResponse({
            "message": "¡Suscripción exitosa!"
        })

    except Exception:
        return JsonResponse({
            "message": "Error interno del servidor"
        }, status=500)


def validar_correo(request):
    email = request.GET.get("email", "").strip().lower()

    if not email:
        return JsonResponse({"exists": False, "message": ""})

    if not is_valid_email(email):
        return JsonResponse({
            "exists": False,
            "message": "Ingresa un correo electrónico válido."
        }, status=400)

    exists = User.objects.filter(email=email).exists() or User.objects.filter(username=email).exists()
    return JsonResponse({
        "exists": exists,
        "message": "Ya existe una cuenta registrada con este correo. Puedes iniciar sesión." if exists else "Correo disponible."
    })
