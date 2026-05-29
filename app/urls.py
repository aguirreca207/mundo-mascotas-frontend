from django.contrib.auth import views as auth_views
from django.urls import path
from . import views

urlpatterns = [
    # 🔹 HOME
    path('', views.home, name='home'),

    # 🔹 AUTENTICACIÓN
    path('login/', views.login_view, name='login'),
    path('registro/', views.registro, name='registro'),
    path(
        'recuperar-contrasena/',
        auth_views.PasswordResetView.as_view(
            template_name='app/password_reset_form.html',
            email_template_name='app/password_reset_email.html',
            subject_template_name='app/password_reset_subject.txt',
            success_url='/recuperar-contrasena/enviado/'
        ),
        name='password_reset'
    ),
    path(
        'recuperar-contrasena/enviado/',
        auth_views.PasswordResetDoneView.as_view(template_name='app/password_reset_done.html'),
        name='password_reset_done'
    ),
    path(
        'recuperar-contrasena/<uidb64>/<token>/',
        auth_views.PasswordResetConfirmView.as_view(
            template_name='app/password_reset_confirm.html',
            success_url='/recuperar-contrasena/completa/'
        ),
        name='password_reset_confirm'
    ),
    path(
        'recuperar-contrasena/completa/',
        auth_views.PasswordResetCompleteView.as_view(template_name='app/password_reset_complete.html'),
        name='password_reset_complete'
    ),
    path('perfil/', views.perfil, name='perfil'),
    path('perfil/editar/', views.editar_perfil, name='editar_perfil'),
    path('logout/', views.logout_view, name='logout'),

    # 🔹 MÓDULOS PRINCIPALES
    path('mascotas/', views.mascotas, name='mascotas'),
    path('mascotas/eliminar/<int:pet_id>/', views.eliminar_mascota, name='eliminar_mascota'),
    path('citas/', views.citas, name='citas'),
    path('citas/crear/', views.crear_cita, name='crear_cita'),
    path('citas/cancelar/<int:appointment_id>/', views.cancelar_cita, name='cancelar_cita'),
    path('tienda/', views.tienda, name='tienda'),
    path('tienda/pedido/crear/', views.crear_pedido, name='crear_pedido'),
    path('servicios/', views.servicios, name='servicios'),
    path('servicios/reserva/crear/', views.crear_reserva_servicio, name='crear_reserva_servicio'),
    path('adopciones/', views.adopciones, name='adopciones'),
    path('adopciones/solicitar/<int:pet_id>/', views.solicitar_adopcion, name='solicitar_adopcion'),
    path('gestion-api/', views.gestion_api, name='gestion_api'),

    # 🔹 API / FUNCIONALIDAD
    path('newsletter/', views.newsletter, name='newsletter'),
    path('validar-correo/', views.validar_correo, name='validar_correo'),
    path('api-externa/mascota/', views.external_pet_api, name='external_pet_api'),
]
