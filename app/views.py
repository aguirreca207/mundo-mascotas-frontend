from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib import messages
from .models import UserProfile, Pet, Product, Order, OrderItem, AdoptionPet
import json


# 🔹 HOME
def home(request):
    return render(request, 'app/index.html')


# 🔹 AUTENTICACIÓN
def login_view(request):
    if request.method == "POST":
        email = request.POST.get("email", "").strip().lower()
        password = request.POST.get("password", "")
        remember = request.POST.get("remember")

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
            "login_error": "Correo o contraseña incorrectos.",
            "prefill_email": email
        })

    return render(request, "app/login.html", {
        "prefill_email": request.GET.get("email", "").strip().lower()
    })


@login_required(login_url="/login/")
def perfil(request):
    return render(request, 'app/perfil.html')


@login_required(login_url="/login/")
def editar_perfil(request):
    profile, created = UserProfile.objects.get_or_create(user=request.user)

    if request.method == "POST":
        request.user.first_name = request.POST.get("name", "").strip()
        request.user.email = request.POST.get("email", "").strip().lower()
        request.user.username = request.user.email
        request.user.save()

        profile.phone = request.POST.get("phone", "").strip()
        profile.city = request.POST.get("city", "").strip()
        profile.address = request.POST.get("address", "").strip()
        profile.save()

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

        if password != confirm_password:
            return render(request, "app/registro.html", {
                "register_error": "Las contraseñas no coinciden."
            })

        if not accept_terms:
            return render(request, "app/registro.html", {
                "register_error": "Debes aceptar los términos para continuar."
            })

        if User.objects.filter(email=email).exists() or User.objects.filter(username=email).exists():
            return render(request, "app/registro.html", {
                "register_error": "Ya existe una cuenta con este correo electrónico."
            })

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=name
        )

        profile, created = UserProfile.objects.get_or_create(user=user)
        profile.phone = phone
        profile.city = city
        profile.address = address
        profile.save()

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

        if pet_id:
            pet = Pet.objects.get(id=pet_id, owner=request.user)
            pet.name = name
            pet.pet_type = pet_type
            pet.breed = breed
            pet.birth_date = birth_date
            pet.vaccines = vaccines
            pet.status = status
            pet.notes = notes
            pet.save()
        else:
            Pet.objects.create(
                owner=request.user,
                name=name,
                pet_type=pet_type,
                breed=breed,
                birth_date=birth_date,
                vaccines=vaccines,
                status=status,
                notes=notes
            )

        return redirect("mascotas")

    pets = Pet.objects.filter(owner=request.user).order_by("-created_at")
    return render(request, "app/mascotas.html", {
        "pets": pets
    })
    
@login_required(login_url="/login/")
def eliminar_mascota(request, pet_id):
    if request.method == "POST":
        pet = Pet.objects.get(id=pet_id, owner=request.user)
        pet.delete()

    return redirect("mascotas")
    
    


@login_required(login_url="/login/")
def citas(request):
    pets = Pet.objects.filter(owner=request.user).order_by("name")
    return render(request, "app/citas.html", {
        "pets": pets
    })


def tienda(request):
    products = Product.objects.filter(is_active=True).order_by("-created_at")
    return render(request, "app/tienda.html", {
        "products": products
    })


@login_required(login_url="/login/")
def servicios(request):
    pets = Pet.objects.filter(owner=request.user).order_by("name")
    return render(request, "app/servicios.html", {
        "pets": pets
    })


@staff_member_required(login_url="/login/")
def gestion_api(request):
    return render(request, "app/gestion_api.html")


@login_required(login_url="/login/")
def adopciones(request):
    if request.method == "POST":
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

            return render(request, "app/adopciones.html", {
                "approved_pets": approved_pets,
                "my_requests": my_requests,
                "adoption_error": "Completa todos los campos para enviar la solicitud."
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
            contact_phone=contact_phone,
            photo=photo
        )

        messages.success(
            request,
            "Solicitud enviada correctamente. Quedó pendiente de revisión por el administrador."
        )

        return redirect("adopciones")

    approved_pets = AdoptionPet.objects.filter(status="aprobado").order_by("-created_at")
    my_requests = AdoptionPet.objects.filter(owner=request.user).order_by("-created_at")

    return render(request, "app/adopciones.html", {
        "approved_pets": approved_pets,
        "my_requests": my_requests
    })


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

        if "@" not in email:
            return JsonResponse({"message": "Correo inválido"}, status=400)

        return JsonResponse({
            "message": "¡Suscripción exitosa!"
        })

    except Exception:
        return JsonResponse({
            "message": "Error interno del servidor"
        }, status=500)
