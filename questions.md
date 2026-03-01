🎓 PROFESOR: Antes de entrar en el código, explicame con tus palabras: ¿qué es HBnB y qué problema resuelve?

✅ RESPUESTA: HBnB es un clon simplificado de AirBnB desarrollado como proyecto educativo en Holberton. Resuelve la gestión de alquileres temporales: permite registrar usuarios, publicar lugares, agregarles comodidades y dejar reseñas. La Parte 2 específicamente se enfoca en construir la API REST que expone toda esa lógica de negocio al mundo exterior.


🎓 PROFESOR: ¿Por qué usaron una arquitectura de 3 capas? ¿No era más fácil poner todo en un solo archivo?

✅ RESPUESTA: Podría funcionar al principio, pero sería un desastre a medida que crece. La arquitectura en 3 capas — Presentación, Lógica de Negocio y Persistencia — nos da separación de responsabilidades. Si mañana queremos cambiar la base de datos de memoria a SQL, solo tocamos la capa de Persistencia. Si queremos cambiar de Flask a otro framework, solo tocamos la Presentación. El resto del código no se entera del cambio.


🎓 PROFESOR: Explícame el Patrón Facade. ¿Por qué lo usaron y qué problema soluciona en este proyecto específicamente?

✅ RESPUESTA: La Facade es el intermediario entre la API y los repositorios. Sin ella, cada endpoint tendría que saber cómo funcionan los 4 repositorios, cómo instanciar los modelos, cómo validar los datos. Con la Facade, el endpoint solo hace una llamada como facade.create_user(data) y la Facade se encarga de todo lo demás. Además, al crear una sola instancia en services/__init__.py, todos los archivos comparten el mismo estado en memoria — si users.py guarda un usuario, places.py lo puede encontrar porque ambos usan el mismo objeto facade.


🎓 PROFESOR: ¿Qué es un InMemoryRepository y cuál es su limitación más importante?

✅ RESPUESTA: Es un repositorio que guarda los datos en un diccionario de Python en memoria. La llave es el UUID del objeto y el valor es el objeto completo. Su limitación principal es que los datos son volátiles — cada vez que se reinicia el servidor, todo se pierde. Por eso en la Parte 3 se va a reemplazar por un repositorio con base de datos SQL real. La ventaja de haberlo diseñado con una clase abstracta Repository(ABC) es que ese cambio va a requerir modificar muy poco código.


🎓 PROFESOR: ¿Por qué usaron UUID en lugar de IDs numéricos como 1, 2, 3?

✅ RESPUESTA: Por tres razones. Primero, seguridad: con IDs numéricos secuenciales alguien podría adivinar fácilmente el ID de otro usuario y acceder a sus datos. Segundo, unicidad global: un UUID generado en cualquier máquina del mundo tiene una probabilidad casi nula de colisionar con otro. Tercero, escalabilidad: en sistemas distribuidos con múltiples servidores, los IDs numéricos requieren coordinación central para evitar duplicados — los UUID no.


🎓 PROFESOR: Mostrá el modelo User y explicame las validaciones. ¿Qué pasa si mando un email sin el símbolo @?

✅ RESPUESTA: El modelo User valida tres cosas en su constructor: que first_name y last_name no estén vacíos y no superen los 50 caracteres, y que el email tenga formato válido usando una expresión regular. Si mandás un email sin @, la expresión regular [^@]+@[^@]+\.[^@]+ no lo acepta y el constructor lanza un ValueError("Invalid email"). Ese error sube por la Facade, llega al try/except en users.py y se devuelve como una respuesta HTTP 400 con el mensaje de error en JSON.


🎓 PROFESOR: ¿Cuál es la diferencia entre el DELETE de reviews y por qué no implementaron DELETE para users, places y amenities?

✅ RESPUESTA: Es una decisión de diseño del proyecto de Holberton para esta parte. El DELETE de reviews se implementa primero porque es el caso más simple: una reseña no tiene dependencias — borrarla no afecta a ninguna otra entidad. En cambio, borrar un usuario implicaría decidir qué pasa con sus lugares y reseñas, borrar un lugar implicaría decidir qué pasa con sus reseñas, y borrar una amenity implicaría desvincularla de todos los lugares. Esa lógica de cascada se deja para cuando tengamos una base de datos real en la Parte 3.


🎓 PROFESOR: Explícame cómo funcionan los tests. ¿Por qué no necesitan levantar el servidor para ejecutarlos?

✅ RESPUESTA: Usamos el test client integrado de Flask. En lugar de hacer peticiones HTTP reales a un servidor corriendo en el puerto 5000, el test client simula esas peticiones internamente en memoria. Creamos la app con create_app(), le activamos el modo TESTING, y usamos app.test_client() para hacer los requests. El resultado es idéntico a lo que devolvería el servidor real pero sin overhead de red. Por eso 54 tests corren en 0.37 segundos.


🎓 PROFESOR: Si yo te mando un POST /places/ con un owner_id que no existe, ¿qué pasa exactamente, paso a paso?

✅ RESPUESTA: Primero, el JSON llega al endpoint PlaceList.post() en places.py. El endpoint llama a facade.create_place(request.json). Dentro de la Facade, después de validar los campos requeridos y los valores de precio, latitud y longitud, hace self.user_repo.get(place_data['owner_id']). Como ese ID no existe en el repositorio, devuelve None. La Facade lanza ValueError("Owner not found"). Ese error sube al except ValueError en el endpoint, que lo convierte en {'error': 'Owner not found'} con código HTTP 400.


🎓 PROFESOR: ¿Qué hace exactamente load_dotenv() y por qué es importante para la seguridad?

✅ RESPUESTA: load_dotenv() lee el archivo .env que está en la raíz del proyecto y carga todas las variables definidas ahí como variables de entorno del sistema operativo. Esto es importante porque el .env está en el .gitignore — nunca se sube a GitHub. Entonces podemos poner claves secretas como SECRET_KEY en ese archivo sin riesgo de exponerlas públicamente. El código solo accede a esas claves a través de os.getenv(), que las lee del entorno en tiempo de ejecución.
