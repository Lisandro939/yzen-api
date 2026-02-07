require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // CORS abierto a todas las aplicaciones
app.use(express.json({ limit: '50mb' })); // Aumentamos el límite para imágenes en base64
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configurar el transporter de nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verificar conexión con el servidor SMTP al iniciar
transporter.verify((error, success) => {
  if (error) {
    console.error('Error al conectar con el servidor SMTP:', error);
  } else {
    console.log('Servidor SMTP listo para enviar emails');
  }
});

// Endpoint para enviar email con información de imagen
app.post('/api/send-email', async (req, res) => {
  try {
    const { nombre, compania, email, mensaje, imagen } = req.body;

    // Validación básica
    if (!nombre || !email || !mensaje) {
      return res.status(400).json({
        success: false,
        message: 'Los campos nombre, email y mensaje son obligatorios',
      });
    }

    // Configurar el contenido del email
    const mailOptions = {
      from: `"${nombre}" <${process.env.SMTP_USER}>`,
      to: 'yzensoftware@gmail.com',
      replyTo: email,
      subject: `Nueva propuesta de ${nombre}${compania ? ` - ${compania}` : ''}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #333; border-bottom: 2px solid #00d4ff; padding-bottom: 10px;">
            Nueva Propuesta Recibida
          </h2>
          
          <div style="margin: 20px 0;">
            <p><strong>Nombre:</strong> ${nombre}</p>
            ${compania ? `<p><strong>Compañía:</strong> ${compania}</p>` : ''}
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          </div>

          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #555; margin-top: 0;">Mensaje:</h3>
            <p style="color: #333; white-space: pre-wrap;">${mensaje}</p>
          </div>

          ${imagen ? '<p style="color: #666; font-style: italic;">Se adjunta una imagen.</p>' : ''}
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            Este mensaje fue enviado desde el formulario de contacto de YZEN Software.
          </p>
        </div>
      `,
    };

    // Si hay imagen, agregarla como adjunto
    if (imagen) {
      // Soporta tanto base64 con prefijo data:image como base64 puro
      let imageData = imagen;
      let imageType = 'png';

      if (imagen.includes('data:image')) {
        const matches = imagen.match(/data:image\/(\w+);base64,(.+)/);
        if (matches) {
          imageType = matches[1];
          imageData = matches[2];
        }
      }

      mailOptions.attachments = [
        {
          filename: `imagen.${imageType}`,
          content: imageData,
          encoding: 'base64',
        },
      ];
    }

    // Enviar el email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Email enviado correctamente',
    });
  } catch (error) {
    console.error('Error al enviar email:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar el email',
      error: error.message,
    });
  }
});

// Endpoint de salud
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
  });
});

// Endpoint de debug para verificar configuración SMTP
app.get('/api/debug', async (req, res) => {
  const config = {
    SMTP_HOST: process.env.SMTP_HOST || 'NO DEFINIDO',
    SMTP_PORT: process.env.SMTP_PORT || 'NO DEFINIDO',
    SMTP_SECURE: process.env.SMTP_SECURE || 'NO DEFINIDO',
    SMTP_USER: process.env.SMTP_USER ? `${process.env.SMTP_USER.substring(0, 5)}...` : 'NO DEFINIDO',
    SMTP_PASS: process.env.SMTP_PASS ? '****' : 'NO DEFINIDO',
  };

  // Intentar verificar conexión SMTP
  let smtpStatus = 'No verificado';
  try {
    await transporter.verify();
    smtpStatus = 'Conexión exitosa';
  } catch (error) {
    smtpStatus = `Error: ${error.message}`;
  }

  res.status(200).json({
    success: true,
    config,
    smtpStatus,
    nodeEnv: process.env.NODE_ENV || 'development',
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
