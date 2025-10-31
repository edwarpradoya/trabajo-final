from flask import Flask, request, jsonify
from flask_cors import CORS
from functools import wraps
import jwt
import datetime
from models import User, Category, Product

app = Flask(__name__)
app.config['SECRET_KEY'] = 'tu_clave_secreta_muy_segura_aqui'
CORS(app)


# Decorador para verificar token JWT
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'message': 'Token es requerido'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.get_user_by_username(data['username'])
        except:
            return jsonify({'message': 'Token inválido'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

# Decorador para verificar si es admin
def admin_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user['role'] != 'admin':
            return jsonify({'message': 'Se requieren permisos de administrador'}), 403
        return f(current_user, *args, **kwargs)
    return decorated

# Rutas de autenticación
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        if not username or not email or not password:
            return jsonify({'message': 'Todos los campos son requeridos'}), 400
        
        if User.create_user(username, email, password):
            return jsonify({'message': 'Usuario registrado exitosamente'}), 201
        else:
            return jsonify({'message': 'Error al registrar usuario'}), 500
            
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'message': 'Usuario y contraseña son requeridos'}), 400
        
        user = User.get_user_by_username_or_email(username)
        
        if user and User.verify_password(user['password'], password):
            # CORREGIR el warning de datetime y el token
            token_payload = {
                'username': user['username'],
                'role': user['role'],
                'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24)
            }
            
            # Generar el token
            token = jwt.encode(
                token_payload, 
                app.config['SECRET_KEY'], 
                algorithm="HS256"
            )
            
            # CONVERTIR el token a string (esto soluciona el error)
            if isinstance(token, bytes):
                token = token.decode('utf-8')
            else:
                token = str(token)
            
            return jsonify({
                'message': 'Login exitoso',
                'token': token,  # Ahora es un string
                'user': {
                    'id': user['id'],
                    'username': user['username'],
                    'email': user['email'],
                    'role': user['role']
                }
            }), 200
        else:
            return jsonify({'message': 'Credenciales inválidas'}), 401
            
    except Exception as e:
        print(f"💥 DEBUG - Error general: {str(e)}")
        return jsonify({'message': f'Error: {str(e)}'}), 500

# Rutas de productos (accesibles para todos los usuarios autenticados)
@app.route('/api/products', methods=['GET'])
@token_required
def get_products(current_user):
    try:
        products = Product.get_all_products()
        return jsonify(products), 200
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

@app.route('/api/products/<int:product_id>', methods=['GET'])
@token_required
def get_product(current_user, product_id):
    try:
        product = Product.get_product_by_id(product_id)
        if product:
            return jsonify(product), 200
        else:
            return jsonify({'message': 'Producto no encontrado'}), 404
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

# Rutas de administración (solo para admins)
# En la ruta create_product
@app.route('/api/admin/products', methods=['POST'])
@token_required
@admin_required
def create_product(current_user):
    try:
        data = request.get_json()
        name = data.get('name')
        description = data.get('description')
        price = data.get('price')
        category_id = data.get('category_id')
        quantity = data.get('quantity')
        image_url = data.get('image_url')  # Nuevo campo
        
        if not all([name, price, category_id, quantity]):
            return jsonify({'message': 'Nombre, precio, categoría y cantidad son requeridos'}), 400
        
        if Product.create_product(name, description, price, category_id, quantity, image_url):
            return jsonify({'message': 'Producto creado exitosamente'}), 201
        else:
            return jsonify({'message': 'Error al crear producto'}), 500
            
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

# En la ruta update_product
@app.route('/api/admin/products/<int:product_id>', methods=['PUT'])
@token_required
@admin_required
def update_product(current_user, product_id):
    try:
        data = request.get_json()
        name = data.get('name')
        description = data.get('description')
        price = data.get('price')
        category_id = data.get('category_id')
        quantity = data.get('quantity')
        image_url = data.get('image_url')  # Nuevo campo
        
        if not all([name, price, category_id, quantity]):
            return jsonify({'message': 'Nombre, precio, categoría y cantidad son requeridos'}), 400
        
        if Product.update_product(product_id, name, description, price, category_id, quantity, image_url):
            return jsonify({'message': 'Producto actualizado exitosamente'}), 200
        else:
            return jsonify({'message': 'Error al actualizar producto'}), 500
            
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

@app.route('/api/admin/products/<int:product_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_product(current_user, product_id):
    try:
        if Product.delete_product(product_id):
            return jsonify({'message': 'Producto eliminado exitosamente'}), 200
        else:
            return jsonify({'message': 'Error al eliminar producto'}), 500
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

# Rutas de categorías (solo para admins)
@app.route('/api/admin/categories', methods=['GET'])
@token_required
@admin_required
def get_categories_admin(current_user):
    try:
        categories = Category.get_all_categories()
        return jsonify(categories), 200
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

@app.route('/api/admin/categories', methods=['POST'])
@token_required
@admin_required
def create_category(current_user):
    try:
        data = request.get_json()
        name = data.get('name')
        description = data.get('description')
        
        if not name:
            return jsonify({'message': 'Nombre de categoría es requerido'}), 400
        
        if Category.create_category(name, description):
            return jsonify({'message': 'Categoría creada exitosamente'}), 201
        else:
            return jsonify({'message': 'Error al crear categoría'}), 500
            
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

@app.route('/api/admin/categories/<int:category_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_category(current_user, category_id):
    try:
        if Category.delete_category(category_id):
            return jsonify({'message': 'Categoría eliminada exitosamente'}), 200
        else:
            return jsonify({'message': 'Error al eliminar categoría'}), 500
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)