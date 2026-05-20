from django.contrib import admin
from .models import UserProfile, Pet, Product, Order, OrderItem, AdoptionPet


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


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "status", "total", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("user__email",)
    inlines = [OrderItemInline]
    
@admin.register(AdoptionPet)
class AdoptionPetAdmin(admin.ModelAdmin):
    list_display = ("name", "pet_type", "city", "status", "owner", "created_at")
    list_filter = ("status", "pet_type", "size", "city")
    search_fields = ("name", "city", "owner__email", "description")
    readonly_fields = ("created_at", "updated_at")    