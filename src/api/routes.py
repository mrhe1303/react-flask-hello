"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint, session
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
import datetime

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api, supports_credentials=True)

@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }
    return jsonify(response_body), 200

@api.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"message": "Email and password are required"}), 400
    
    
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({"message": "User already exists"}), 400
    
    try:
        user = User()
        user.email = data['email']
        user.set_password(data['password'])
        user.is_active = True
        
        db.session.add(user)
        db.session.commit()
        
        # Create session
        session['user_id'] = user.id
        session.permanent = True
        
        return jsonify({
            "message": "User created successfully",
            "user": user.serialize()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error creating user"}), 500

@api.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"message": "Email and password are required"}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({"message": "Invalid credentials"}), 401
    
    if not user.is_active:
        return jsonify({"message": "User account is deactivated"}), 401
    
    # Create session
    session['user_id'] = user.id
    session.permanent = True
    
    return jsonify({
        "message": "Login successful",
        "user": user.serialize()
    }), 200

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
        "message": "This is private data",
        "user": user.serialize()
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