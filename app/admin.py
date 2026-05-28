from django.contrib import admin
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

admin.site.site_header = "Mundo Mascotas | Administración"
admin.site.site_title = "Admin Mundo Mascotas"
admin.site.index_title = "Gestión operativa"


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "phone", "city", "address")
    search_fields = ("user__email", "user__first_name", "phone", "city")


@admin.register(Pet)
class PetAdmin(admin.ModelAdmin):
    list_display = ("name", "pet_type", "breed", "owner", "status")
    search_fields = ("name", "breed", "owner__email")
    list_filter = ("pet_type", "status")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "pet_type", "price", "stock", "is_active")
    list_filter = ("category", "pet_type", "is_active")
    search_fields = ("name", "description")
    list_editable = ("stock", "is_active")
    actions = ("activate_products", "deactivate_products")

    @admin.action(description="Activar productos seleccionados")
    def activate_products(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f"{updated} producto(s) activado(s).")

    @admin.action(description="Desactivar productos seleccionados")
    def deactivate_products(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f"{updated} producto(s) desactivado(s).")


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product", "quantity", "price", "line_total")
    can_delete = False

    def line_total(self, obj):
        return obj.quantity * obj.price

    line_total.short_description = "Subtotal"


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "customer_email", "status", "item_count", "total", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("user__email", "user__first_name", "items__product__name")
    list_editable = ("status",)
    readonly_fields = ("user", "total", "created_at")
    inlines = [OrderItemInline]
    actions = ("mark_pending", "mark_confirmed", "mark_delivered", "mark_cancelled")

    def customer_email(self, obj):
        return obj.user.email

    customer_email.short_description = "Cliente"

    def item_count(self, obj):
        return obj.items.count()

    item_count.short_description = "Productos"

    @admin.action(description="Marcar pedidos como pendientes")
    def mark_pending(self, request, queryset):
        updated = queryset.update(status="pendiente")
        self.message_user(request, f"{updated} pedido(s) marcado(s) como pendiente(s).")

    @admin.action(description="Confirmar pedidos seleccionados")
    def mark_confirmed(self, request, queryset):
        updated = queryset.update(status="confirmado")
        self.message_user(request, f"{updated} pedido(s) confirmado(s).")

    @admin.action(description="Marcar pedidos como entregados")
    def mark_delivered(self, request, queryset):
        updated = queryset.update(status="entregado")
        self.message_user(request, f"{updated} pedido(s) marcado(s) como entregado(s).")

    @admin.action(description="Cancelar pedidos seleccionados")
    def mark_cancelled(self, request, queryset):
        updated = queryset.update(status="cancelado")
        self.message_user(request, f"{updated} pedido(s) cancelado(s).")


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ("pet", "user", "reason", "preferred_date", "preferred_time", "status", "created_at")
    list_filter = ("status", "preferred_time", "preferred_date")
    search_fields = ("pet__name", "user__email", "reason", "admin_notes")
    list_editable = ("status",)
    fieldsets = (
        ("Solicitud del cliente", {
            "fields": ("user", "pet", "reason", "preferred_date", "preferred_time", "notes")
        }),
        ("Gestión administrativa", {
            "fields": ("status", "admin_notes")
        }),
    )

    @admin.action(description="Confirmar citas seleccionadas")
    def confirm_appointments(self, request, queryset):
        updated = queryset.update(status="confirmada")
        self.message_user(request, f"{updated} cita(s) confirmada(s).")

    @admin.action(description="Cancelar citas seleccionadas")
    def cancel_appointments(self, request, queryset):
        updated = queryset.update(status="cancelada")
        self.message_user(request, f"{updated} cita(s) cancelada(s).")

    actions = ("confirm_appointments", "cancel_appointments")


@admin.register(ServiceReservation)
class ServiceReservationAdmin(admin.ModelAdmin):
    list_display = ("service", "pet", "user", "preferred_time", "walker", "status", "created_at")
    list_filter = ("status", "service")
    search_fields = ("service", "pet__name", "user__email", "walker")
    list_editable = ("status",)
    
@admin.register(AdoptionPet)
class AdoptionPetAdmin(admin.ModelAdmin):
    list_display = ("name", "pet_type", "city", "status", "owner", "contact_phone", "created_at")
    list_editable = ("status",)
    list_filter = ("status", "pet_type", "size", "city")
    search_fields = ("name", "city", "owner__email", "description")
    readonly_fields = ("created_at", "updated_at")
    actions = ("approve_requests", "reject_requests")
    fieldsets = (
        ("Información de la mascota", {
            "fields": ("name", "pet_type", "age", "size", "city", "photo")
        }),
        ("Contacto y publicación", {
            "fields": ("owner", "contact_phone", "description", "requirements")
        }),
        ("Revisión administrativa", {
            "fields": ("status", "admin_notes", "created_at", "updated_at")
        }),
    )

    @admin.action(description="Aprobar solicitudes seleccionadas")
    def approve_requests(self, request, queryset):
        updated = queryset.update(status="aprobado")
        self.message_user(request, f"{updated} publicación(es) aprobada(s).")

    @admin.action(description="Rechazar solicitudes seleccionadas")
    def reject_requests(self, request, queryset):
        updated = queryset.update(status="rechazado")
        self.message_user(request, f"{updated} publicación(es) rechazada(s).")


@admin.register(AdoptionApplication)
class AdoptionApplicationAdmin(admin.ModelAdmin):
    list_display = ("pet", "applicant", "status", "created_at")
    list_filter = ("status", "created_at", "pet__pet_type", "pet__city")
    search_fields = ("pet__name", "applicant__email", "message", "admin_notes")
    list_editable = ("status",)
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        ("Solicitud", {
            "fields": ("pet", "applicant", "message", "created_at", "updated_at")
        }),
        ("Gestión administrativa", {
            "fields": ("status", "admin_notes")
        }),
    )
    actions = ("approve_applications", "reject_applications")

    @admin.action(description="Aprobar solicitudes seleccionadas")
    def approve_applications(self, request, queryset):
        updated = queryset.update(status="aprobada")
        self.message_user(request, f"{updated} solicitud(es) aprobada(s).")

    @admin.action(description="Rechazar solicitudes seleccionadas")
    def reject_applications(self, request, queryset):
        updated = queryset.update(status="rechazada")
        self.message_user(request, f"{updated} solicitud(es) rechazada(s).")
