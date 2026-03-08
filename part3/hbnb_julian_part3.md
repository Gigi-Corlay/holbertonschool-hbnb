# Task 0 — Modify the Application Factory to Include the Configuration

## ¿Qué es el Application Factory Pattern?

El **Application Factory** es un patrón de diseño en Flask donde en vez de crear la app Flask directamente al inicio del archivo, la creás dentro de una función llamada `create_app()`. Esto te permite:

- Crear múltiples instancias de la app con distintas configuraciones (desarrollo, producción, testing)
- Evitar importaciones circulares
- Facilitar el testing

## ¿Qué había antes en `app/__init__.py`?

```python
def create_app():
    app = Flask(__name__)
    # ...
    return app
```

El problema es que `create_app()` no recibía ningún parámetro, entonces siempre usaba la misma configuración hardcodeada. La clase `Config` en `config.py` existía pero nunca se usaba.

## ¿Qué cambia en el Task 0?

Tres cosas:

1. `create_app()` ahora recibe un parámetro `config_class`
2. La app carga la configuración con `app.config.from_object(config_class)`
3. Se agrega `SQLALCHEMY_DATABASE_URI` y `SQLALCHEMY_TRACK_MODIFICATIONS` a `config.py` para preparar la base de datos

---

## Archivos modificados

### 1. `config.py`

**Antes:**
```python
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'default_secret_key')
    DEBUG = False

class DevelopmentConfig(Config):
    DEBUG = True

config = {
    'development': DevelopmentConfig,
    'default': DevelopmentConfig
}
```

**Después:**
```python
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'default_secret_key')
    DEBUG = False

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///development.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

config = {
    'development': DevelopmentConfig,
    'default': DevelopmentConfig
}
```

**¿Por qué se agrega `SQLALCHEMY_DATABASE_URI`?**
Le dice a SQLAlchemy dónde guardar la base de datos. En este caso usamos SQLite (un archivo local llamado `development.db`). En producción se cambia por una URL de MySQL.

**¿Por qué `SQLALCHEMY_TRACK_MODIFICATIONS = False`?**
SQLAlchemy tiene una función que trackea cambios en los objetos para enviar señales. Esa función consume memoria extra y no la necesitamos, así que la desactivamos.

---

### 2. `app/__init__.py`

**Antes:**
```python
from flask import Flask
from flask_restx import Api
from app.api.v1.users import api as users_ns
from app.api.v1.amenities import api as amenities_ns
from app.api.v1.places import api as places_ns
from app.api.v1.reviews import api as reviews_ns

def create_app():
    app = Flask(__name__)

    api = Api(
        app,
        version='1.0',
        title='HBnB API',
        description='HBnB Application API',
        doc='/api/v1/'
    )

    api.add_namespace(users_ns, path='/api/v1/users')
    api.add_namespace(amenities_ns, path='/api/v1/amenities')
    api.add_namespace(places_ns, path='/api/v1/places')
    api.add_namespace(reviews_ns, path='/api/v1/reviews')

    return app
```

**Después:**
```python
from flask import Flask
from flask_restx import Api
from app.api.v1.users import api as users_ns
from app.api.v1.amenities import api as amenities_ns
from app.api.v1.places import api as places_ns
from app.api.v1.reviews import api as reviews_ns
import config as app_config

def create_app(config_class=app_config.DevelopmentConfig):
    app = Flask(__name__)
    app.config.from_object(config_class)

    api = Api(
        app,
        version='1.0',
        title='HBnB API',
        description='HBnB Application API',
        doc='/api/v1/'
    )

    api.add_namespace(users_ns, path='/api/v1/users')
    api.add_namespace(amenities_ns, path='/api/v1/amenities')
    api.add_namespace(places_ns, path='/api/v1/places')
    api.add_namespace(reviews_ns, path='/api/v1/reviews')

    return app
```

**¿Qué cambió exactamente?**

| Línea | Qué hace |
|-------|----------|
| `import config as app_config` | Importa el módulo config.py con un alias para evitar conflicto con el nombre `config` de Flask |
| `config_class=app_config.DevelopmentConfig` | Define `DevelopmentConfig` como configuración por defecto |
| `app.config.from_object(config_class)` | Carga todas las variables de la clase de configuración en la app Flask |

---

### 3. `run.py`

`run.py` no necesita cambios porque ya llama a `create_app()` sin argumentos, y el parámetro por defecto es `DevelopmentConfig`.

```python
from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
```

---

## ¿Cómo se usa en el futuro?

Gracias a este cambio, en el futuro se puede pasar cualquier configuración:

```python
# Modo desarrollo (por defecto)
app = create_app()

# Modo producción (con MySQL)
app = create_app(config.ProductionConfig)

# Modo testing
app = create_app(config.TestingConfig)
```

---

## Verificación

Después de hacer los cambios, verificar que la app sigue funcionando:

```bash
cd part3
python3 run.py
```

La app debe arrancar en `http://127.0.0.1:5000/api/v1/` sin errores.
