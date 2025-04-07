const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'coliexpress';

// Validation helper functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return passwordRegex.test(password);
};

exports.handler = async function(event, context) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { nom, prenom, email, password } = JSON.parse(event.body);

    // Input sanitization
    const sanitizedNom = nom.trim().replace(/[<>]/g, '');
    const sanitizedPrenom = prenom.trim().replace(/[<>]/g, '');
    const sanitizedEmail = email.trim().toLowerCase();

    // Basic validation
    if (!sanitizedNom || !sanitizedPrenom || !sanitizedEmail || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Tous les champs sont requis' })
      };
    }

    // Enhanced validation
    if (!validateEmail(sanitizedEmail)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email invalide' })
      };
    }

    if (!validatePassword(password)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre' 
        })
      };
    }

    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(DB_NAME);

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email: sanitizedEmail });
    if (existingUser) {
      await client.close();
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Cet email est déjà utilisé' })
      };
    }

    // Hash password with increased salt rounds for better security
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user with additional fields
    await db.collection('users').insertOne({
      nom: sanitizedNom,
      prenom: sanitizedPrenom,
      email: sanitizedEmail,
      password: hashedPassword,
      createdAt: new Date(),
      lastLogin: null,
      isActive: true,
      role: 'user'
    });

    await client.close();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        message: 'Inscription réussie',
        user: {
          nom: sanitizedNom,
          prenom: sanitizedPrenom,
          email: sanitizedEmail
        }
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erreur serveur' })
    };
  }
}; 