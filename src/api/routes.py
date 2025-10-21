"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import request, jsonify, Blueprint, session
from api.models import db, User
from api.utils import generate_sitemap, APIException

api = Blueprint('api', __name__)

@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }
    return jsonify(response_body), 200

@api.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()

        if not data or not data.get('email') or not data.get('password'):
            return jsonify({"message": "Email and password are required"}), 400
        
        
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({"message": "User already exists"}), 400
        
        
        user = User()
        user.email = data['email']
        user.set_password(data['password'])
        user.is_active = True
        
        db.session.add(user)
        db.session.commit()
        
        
        session['user_id'] = user.id
        session.permanent = True
        
        return jsonify({
            "message": "User created successfully",
            "user": user.serialize()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print("Signup error:", str(e))
        return jsonify({"message": "Error creating user"}), 500

@api.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()

        if not data or not data.get('email') or not data.get('password'):
            return jsonify({"message": "Email and password are required"}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({"message": "Invalid credentials"}), 401
        
        if not user.is_active:
            return jsonify({"message": "User account is deactivated"}), 401        
        
        session['user_id'] = user.id
        session.permanent = True
        
        return jsonify({
            "message": "Login successful",
            "user": user.serialize()
        }), 200
        
    except Exception as e:
        print("Login error:", str(e))
        return jsonify({"message": "Error during login"}), 500

@api.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({"message": "Logout successful"}), 200

@api.route('/private', methods=['GET'])
def private_route():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 401
    
    return jsonify({
        "message": "This is private data - Welcome to the protected area!",
        "user": user.serialize(),
        "private_content": "This is sensitive information that only logged-in users can see."
    }), 200

@api.route('/user', methods=['GET'])
def get_current_user():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({"message": "Not authenticated"}), 401
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 401
    
    return jsonify({"user": user.serialize()}), 200