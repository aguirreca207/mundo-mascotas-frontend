from django.urls import path
from . import views

urlpatterns = [
    # 🔹 HOME
    path('', views.home, name='home'),

    # 🔹 AUTENTICACIÓN
    path('login/', views.login_view, name='login'),
    path('registro/', views.registro, name='registro'),
    path('perfil/', views.perfil, name='perfil'),
    path('perfil/editar/', views.editar_perfil, name='editar_perfil'),
    path('logout/', views.logout_view, name='logout'),

    # 🔹 MÓDULOS PRINCIPALES
    path('mascotas/', views.mascotas, name='mascotas'),
    path('mascotas/eliminar/<int:pet_id>/', views.eliminar_mascota, name='eliminar_mascota'),
    path('citas/', views.citas, name='citas'),
    path('tienda/', views.tienda, name='tienda'),
    path('servicios/', views.servicios, name='servicios'),
    path('adopciones/', views.adopciones, name='adopciones'),

    # 🔹 API / FUNCIONALIDAD
    path('newsletter/', views.newsletter, name='newsletter'),
]