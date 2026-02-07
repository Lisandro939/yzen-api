
## Endpoints

### Enviar Email

**`POST https://yzen-api-production.up.railway.app/api/send-email`**

Envía un email con la información del formulario de contacto a `yzensoftware@gmail.com`.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
| Campo     | Tipo   | Requerido | Descripción                          |
|-----------|--------|-----------|--------------------------------------|
| nombre    | string | ✅ Sí     | Nombre del remitente                 |
| email     | string | ✅ Sí     | Email del remitente (para responder) |
| mensaje   | string | ✅ Sí     | Contenido del mensaje                |
| compania  | string | ❌ No     | Nombre de la empresa                 |
| imagen    | string | ❌ No     | Imagen en base64 (con o sin prefijo data:image) |

**Ejemplo:**
```json
{
  "nombre": "Juan Pérez",
  "compania": "Mi Empresa S.A.",
  "email": "juan@ejemplo.com",
  "mensaje": "Hola, me gustaría saber más sobre sus servicios.",
  "imagen": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

#### Respuestas

**✅ Éxito (200):**
```json
{
  "success": true,
  "message": "Email enviado correctamente"
}
```

**❌ Error de validación (400):**
```json
{
  "success": false,
  "message": "Los campos nombre, email y mensaje son obligatorios"
}
```

**❌ Error del servidor (500):**
```json
{
  "success": false,
  "message": "Error al enviar el email",
  "error": "Descripción del error"
}
```

---

### Health Check

**`GET /api/health`**

Verifica que la API esté funcionando correctamente.

#### Respuesta

```json
{
  "success": true,
  "message": "API funcionando correctamente",
  "timestamp": "2026-02-07T19:22:00.000Z"
}
```

---

## Ejemplo de uso con JavaScript

```javascript
const enviarFormulario = async (datos) => {
  const response = await fetch('https://tu-api.com/api/send-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nombre: datos.nombre,
      compania: datos.compania,
      email: datos.email,
      mensaje: datos.mensaje,
      imagen: datos.imagenBase64, // opcional
    }),
  });

  const result = await response.json();
  
  if (result.success) {
    console.log('Email enviado correctamente');
  } else {
    console.error('Error:', result.message);
  }
};
```
