from django.urls import path
from . import views

urlpatterns = [

    # 🔹 HOME
    path('', views.home, name='home'),

    # 🔹 AUTENTICACIÓN
    path('login/', views.login_view, name='login'),
    path('registro/', views.registro, name='registro'),

    # 🔹 MÓDULOS PRINCIPALES
    path('mascotas/', views.mascotas, name='mascotas'),
    path('citas/', views.citas, name='citas'),
    path('tienda/', views.tienda, name='tienda'),
    path('servicios/', views.servicios, name='servicios'),
    path('adopciones/', views.adopciones, name='adopciones'),

    # 🔹 API / FUNCIONALIDAD
    path('newsletter/', views.newsletter, name='newsletter'),

]