from werkzeug.security import generate_password_hash, check_password_hash
import pymysql

def create_connection():
    return pymysql.connect(
        host='localhost',
        user='root',           # Usuario de XAMPP
        password='',           # Contraseña de XAMPP (normalmente vacía)
        database='ecommerce_db', # Nombre de tu base de datos
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )

    def test_password_hashing():
        test_password = "mi_contraseña"
        hashed = generate_password_hash(test_password)
        print(f"Contraseña: {test_password}")
        print(f"Hash: {hashed}")
        print(f"Verificación: {check_password_hash(hashed, test_password)}")

class User:
    @staticmethod
    def get_user_by_username_or_email(identifier):
        connection = create_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute('SELECT * FROM users WHERE username = %s OR email = %s', (identifier, identifier))
                return cursor.fetchone()
        finally:
            connection.close()

    @staticmethod
    def get_user_by_username(username):
        connection = create_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute('SELECT * FROM users WHERE username = %s', (username,))
                return cursor.fetchone()
        finally:
            connection.close()

    @staticmethod
    def verify_password(stored_password, provided_password):
        return check_password_hash(stored_password, provided_password)


    @staticmethod
    def create_user(username, email, password):
        connection = create_connection()
        try:
            with connection.cursor() as cursor:
                hashed_password = generate_password_hash(password)
                cursor.execute('''
                    INSERT INTO users (username, email, password, role)
                    VALUES (%s, %s, %s, 'user')
                ''', (username, email, hashed_password))
                connection.commit()
                return True
        except Exception as e:
            print(f"Error al crear usuario: {e}")
            return False
        finally:
            connection.close()

class Category:
    @staticmethod
    def get_all_categories():
        connection = create_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute('SELECT * FROM categories ORDER BY name')
                return cursor.fetchall()
        finally:
            connection.close()

    @staticmethod
    def create_category(name, description):
        connection = create_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute('''
                    INSERT INTO categories (name, description)
                    VALUES (%s, %s)
                ''', (name, description))
                connection.commit()
                return True
        except Exception as e:
            print(f"Error al crear categoría: {e}")
            return False
        finally:
            connection.close()

    @staticmethod
    def delete_category(category_id):
        connection = create_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute('DELETE FROM categories WHERE id = %s', (category_id,))
                connection.commit()
                return True
        except Exception as e:
            print(f"Error al eliminar categoría: {e}")
            return False
        finally:
            connection.close()

class Product:
    @staticmethod
    def get_all_products():
        connection = create_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute('''
                    SELECT p.*, c.name as category_name 
                    FROM products p 
                    LEFT JOIN categories c ON p.category_id = c.id 
                    ORDER BY p.created_at DESC
                ''')
                return cursor.fetchall()
        finally:
            connection.close()

    @staticmethod
    def get_product_by_id(product_id):
        connection = create_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute('''
                    SELECT p.*, c.name as category_name 
                    FROM products p 
                    LEFT JOIN categories c ON p.category_id = c.id 
                    WHERE p.id = %s
                ''', (product_id,))
                return cursor.fetchone()
        finally:
            connection.close()

    @staticmethod
    def create_product(name, description, price, category_id, quantity, image_url=None):
        connection = create_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute('''
                    INSERT INTO products (name, description, price, category_id, quantity, image_url)
                    VALUES (%s, %s, %s, %s, %s, %s)
                ''', (name, description, price, category_id, quantity, image_url))
                connection.commit()
                return True
        except Exception as e:
            print(f"Error al crear producto: {e}")
            return False
        finally:
            connection.close()

    @staticmethod
    def update_product(product_id, name, description, price, category_id, quantity, image_url=None):
        connection = create_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute('''
                    UPDATE products 
                    SET name = %s, description = %s, price = %s, 
                        category_id = %s, quantity = %s, image_url = %s
                    WHERE id = %s
                ''', (name, description, price, category_id, quantity, image_url, product_id))
                connection.commit()
                return True
        except Exception as e:
            print(f"Error al actualizar producto: {e}")
            return False
        finally:
            connection.close()

    @staticmethod
    def delete_product(product_id):
        connection = create_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute('DELETE FROM products WHERE id = %s', (product_id,))
                connection.commit()
                return True
        except Exception as e:
            print(f"Error al eliminar producto: {e}")
            return False
        finally:
            connection.close()