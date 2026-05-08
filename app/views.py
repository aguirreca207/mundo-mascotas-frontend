from django.shortcuts import render
from django.http import JsonResponse
import json

# 🔹 HOME
def home(request):
    return render(request, 'app/index.html')

# 🔹 AUTENTICACIÓN
def login_view(request):
    return render(request, 'app/login.html')

def registro(request):
    return render(request, 'app/registro.html')

# 🔹 MÓDULOS
def mascotas(request):
    return render(request, 'app/mascotas.html')

def citas(request):
    return render(request, 'app/citas.html')

def tienda(request):
    return render(request, 'app/tienda.html')

def servicios(request):
    return render(request, 'app/servicios.html')

def adopciones(request):
    return render(request, 'app/adopciones.html')

# 🔹 NEWSLETTER (VERSIÓN PRO)
def newsletter(request):
    if request.method != "POST":
        return JsonResponse({"message": "Método no permitido"}, status=405)

    try:
        data = json.loads(request.body)

        email = data.get("email", "").strip()
        pet = data.get("pet_type", "").strip()

        # VALIDACIÓN
        if not email:
            return JsonResponse({"message": "Debes ingresar un correo"}, status=400)

        if "@" not in email:
            return JsonResponse({"message": "Correo inválido"}, status=400)

        # 👉 AQUÍ LUEGO GUARDAMOS EN DB

        return JsonResponse({
            "message": "¡Suscripción exitosa! 🎉"
        })

    except Exception as e:
        return JsonResponse({
            "message": "Error interno del servidor"
        }, status=500)