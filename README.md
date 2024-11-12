# Game Recommender

## Backend

## Ejecución local
En la carpeta `backend` crear un archivo `.env` con el siguiente contenido:
```
API_KEY=
APP_PORT=3000
DB_USERNAME=
DB_PASSWORD=
DB_NAME=
DB_HOST=localhost
AUTH0_DOMAIN=
AUTH0_AUDIENCE=
```

Luego dentro de la misma carpeta correr el comando `npm start`.

## Endpoints

### POST user/register

#### Descripción
Crea un nuevo usuario en la base de datos si es que este no existe.

#### Respuesta
- **200 OK**: Si el usuario ya existe en la base de datos, se retorna la siguiente respuesta:
```json
{
  "message": "User already registered.",
  "user": {user}
}
```
Donde `user` corresponde a la instancia del usuario de la base de datos.

- **201 Created**: Si el usuario no existía en la base de datos, se retorna la siguiente respuesta:
```json
{
  "message": "User registered successfully",
  "user": {user}
}
```
Donde `user` corresponde a la instancia del usuario de la base de datos.

- **500 Internal Server Error**: Si ocurre un error al procesar la solicitud se retorna la siguiente respuesta:
```json
{
  "error": "An error occurred while registering the user."
}
```

### POST api/recommend

#### Descripción
Obtiene recomendaciones de videojuegos según las preferencias especificadas.

#### Cuerpo de la solicitud
La solicitud debe presentar los siguientes campos:
```json
{
    "genre": {genre},
    "favorite": {favorite},
    "type": {type},
}
```
Donde `genre` es un `str` con el género del juego buscado, `favorite` es un `str` con el nombre del juego favorito y `type` es un `str` con el tipo de juego a buscar.

#### Respuesta
- **200 OK**: Si la solicitud se realiza de forma exitosa, se retorna la siguiente respuesta:
```json
{
  "message": "Recommendations generated successfully.",
  "recommendations": {recommendations}
}
```
Donde `recommendations` son las instancias de las recomendaciones creadas en la base de datos.

- **500 Internal Server Error**: Si ocurre un error al procesar la solicitud se retorna la siguiente respuesta:
```json
{
  "error": "An error occurred while generating recommendations."
}
```

### POST api/feedback

#### Descripción
Crea feedbacks a los juegos especificados.

#### Cuerpo de la solicitud
La solicitud debe presentar el campo `"feedbacks"` con el siguiente contenido:
```json
{
  "feedbacks": [
    {
      "recommendationId": {recommendationId},
      "rating": {rating},
      "comment": {comment}
    },
    {
      "recommendationId": {recommendationId},
      "rating": {rating},
      "comment": {comment}
    },
  ]
}
```

Donde `recommendationId` es un `int` con el id de la recomendación a la que se entrega feedback, `rating` es un `int` con la valoración de la recomendación y `comment` es un `str` con el comentario sobre la recomendación.

#### Respuesta
- **201 Created**: Si la solicitud se realiza de forma exitosa, se retorna la siguiente respuesta:
```json
{
  "message": "Feedbacks submitted successfully.",
  "feedbacks": {feedbacks}
}
```
Donde `feedbacks` son las instancias de las retroalimentaciones creadas en la base de datos.

- **500 Internal Server Error**: Si ocurre un error al procesar la solicitud se retorna la siguiente respuesta:
```json
{
  "error": "An error occurred while generating recommendations."
}
```


## Referencias

### Generar texto con la API
https://ai.google.dev/gemini-api/docs/text-generation?hl=es-419&lang=node

### Dar contexto al modelo
https://ai.google.dev/gemini-api/docs/system-instructions
