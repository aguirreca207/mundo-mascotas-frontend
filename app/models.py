from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    phone = models.CharField(max_length=30, blank=True)
    city = models.CharField(max_length=80, blank=True)
    address = models.CharField(max_length=160, blank=True)

    def __str__(self):
        return self.user.email


class Pet(models.Model):
    PET_TYPES = [
        ("Perro", "Perro"),
        ("Gato", "Gato"),
        ("Otro", "Otro"),
    ]

    PET_STATUS = [
        ("Salud estable", "Salud estable"),
        ("Seguimiento preventivo", "Seguimiento preventivo"),
        ("Requiere atención", "Requiere atención"),
    ]

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="pets")
    name = models.CharField(max_length=80)
    pet_type = models.CharField(max_length=20, choices=PET_TYPES)
    breed = models.CharField(max_length=80)
    birth_date = models.DateField()
    vaccines = models.CharField(max_length=160)
    status = models.CharField(max_length=60, choices=PET_STATUS)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.owner.email}"


class Product(models.Model):
    PRODUCT_CATEGORIES = [
        ("alimento", "Alimento"),
        ("juguetes", "Juguetes"),
        ("cuidado", "Cuidado"),
        ("accesorios", "Accesorios"),
    ]

    PET_TYPES = [
        ("perro", "Perro"),
        ("gato", "Gato"),
        ("ambos", "Ambos"),
    ]

    name = models.CharField(max_length=120)
    category = models.CharField(max_length=30, choices=PRODUCT_CATEGORIES)
    pet_type = models.CharField(max_length=20, choices=PET_TYPES)
    description = models.TextField()
    price = models.PositiveIntegerField()
    stock = models.PositiveIntegerField(default=0)
    image = models.CharField(max_length=200, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Order(models.Model):
    STATUS_CHOICES = [
        ("pendiente", "Pendiente"),
        ("confirmado", "Confirmado"),
        ("entregado", "Entregado"),
        ("cancelado", "Cancelado"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="orders")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pendiente")
    total = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Pedido #{self.id} - {self.user.email}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    price = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.get_or_create(user=instance)
        
class AdoptionPet(models.Model):
    STATUS_CHOICES = [
        ("pendiente", "Pendiente"),
        ("aprobado", "Aprobado"),
        ("rechazado", "Rechazado"),
    ]

    PET_TYPES = [
        ("Perro", "Perro"),
        ("Gato", "Gato"),
        ("Otro", "Otro"),
    ]

    SIZE_CHOICES = [
        ("Pequeño", "Pequeño"),
        ("Mediano", "Mediano"),
        ("Grande", "Grande"),
    ]

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="adoption_posts")
    name = models.CharField(max_length=80)
    pet_type = models.CharField(max_length=20, choices=PET_TYPES)
    age = models.CharField(max_length=60)
    size = models.CharField(max_length=20, choices=SIZE_CHOICES)
    city = models.CharField(max_length=80)
    description = models.TextField()
    requirements = models.TextField()
    contact_phone = models.CharField(max_length=30)
    photo = models.ImageField(upload_to="adoptions/")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pendiente")
    admin_notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.get_status_display()}"