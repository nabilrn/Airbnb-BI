"""
🚀 Flask API Deployment for Airbnb Price Prediction Model
============================================================================

This Flask application provides a REST API for the enhanced Airbnb price 
prediction model with ensemble approach and comprehensive feature engineering.

Endpoints:
- GET  /: API documentation and health check
- POST /predict: Single price prediction
- POST /predict/batch: Batch price predictions
- GET  /model/info: Model information and capabilities
- GET  /health: Health check endpoint

Author: Generated for production deployment
Version: 1.0
Date: June 2025
"""

from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import json
import logging
from datetime import datetime
import traceback
import os
import sys
from pathlib import Path

# Import our predictor
from airbnb_price_predictor import AirbnbPricePredictor, load_predictor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global predictor instance
predictor = None

def initialize_predictor():
    """Initialize the prediction model"""
    global predictor
    try:
        model_dir = os.path.dirname(os.path.abspath(__file__))
        predictor = load_predictor(model_dir)
        logger.info("✅ Predictor initialized successfully")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to initialize predictor: {str(e)}")
        return False

def validate_prediction_input(data):
    """Validate input data for prediction"""
    required_fields = [
        'neighbourhood_group', 'neighbourhood', 'room_type',
        'latitude', 'longitude', 'minimum_nights', 'availability_365',
        'number_of_reviews', 'calculated_host_listings_count'
    ]
    
    errors = []
    
    # Check required fields
    for field in required_fields:
        if field not in data:
            errors.append(f"Missing required field: {field}")
        elif data[field] is None:
            errors.append(f"Field '{field}' cannot be null")
    
    if errors:
        return False, errors
    
    # Validate data types and ranges
    try:
        # Validate latitude and longitude
        lat = float(data['latitude'])
        lon = float(data['longitude'])
        if not (-90 <= lat <= 90):
            errors.append("Latitude must be between -90 and 90")
        if not (-180 <= lon <= 180):
            errors.append("Longitude must be between -180 and 180")
        
        # Validate numerical fields
        min_nights = int(data['minimum_nights'])
        if min_nights < 0:
            errors.append("minimum_nights must be non-negative")
        
        availability = int(data['availability_365'])
        if not (0 <= availability <= 365):
            errors.append("availability_365 must be between 0 and 365")
        
        reviews = int(data['number_of_reviews'])
        if reviews < 0:
            errors.append("number_of_reviews must be non-negative")
        
        host_listings = int(data['calculated_host_listings_count'])
        if host_listings < 0:
            errors.append("calculated_host_listings_count must be non-negative")
        
        # Validate categorical fields
        valid_borough = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island']
        if data['neighbourhood_group'] not in valid_borough:
            errors.append(f"neighbourhood_group must be one of: {valid_borough}")
        
        valid_room_types = ['Entire home/apt', 'Private room', 'Shared room']
        if data['room_type'] not in valid_room_types:
            errors.append(f"room_type must be one of: {valid_room_types}")
        
    except (ValueError, TypeError) as e:
        errors.append(f"Invalid data type: {str(e)}")
    
    return len(errors) == 0, errors

# API Documentation Template
API_DOCS = """
<!DOCTYPE html>
<html>
<head>
    <title>Airbnb Price Prediction API</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #ff5a5f; border-bottom: 3px solid #ff5a5f; padding-bottom: 10px; }
        h2 { color: #484848; margin-top: 30px; }
        .endpoint { background-color: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #ff5a5f; }
        .method { font-weight: bold; color: #ff5a5f; }
        .url { font-family: monospace; background: #e9ecef; padding: 2px 6px; border-radius: 3px; }
        .json { background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; font-family: monospace; white-space: pre; }
        .status { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; }
        .status.online { background: #28a745; color: white; }
        .status.offline { background: #dc3545; color: white; }
        .model-info { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏠 Airbnb Price Prediction API</h1>
        
        <div class="model-info">
            <h3>📊 Model Status</h3>
            <p><strong>Status:</strong> <span class="status {{ status_class }}">{{ status }}</span></p>
            <p><strong>Model Version:</strong> {{ model_version }}</p>
            <p><strong>Ensemble Mode:</strong> {{ ensemble_mode }}</p>
            <p><strong>Total Features:</strong> {{ total_features }}</p>
            <p><strong>Last Updated:</strong> {{ timestamp }}</p>
        </div>

        <h2>📋 API Endpoints</h2>

        <div class="endpoint">
            <h3><span class="method">GET</span> <span class="url">/</span></h3>
            <p>API documentation and health check (this page)</p>
        </div>

        <div class="endpoint">
            <h3><span class="method">POST</span> <span class="url">/predict</span></h3>
            <p>Predict price for a single Airbnb listing</p>
            <h4>Request Body:</h4>
            <div class="json">{
  "neighbourhood_group": "Manhattan",
  "neighbourhood": "Upper East Side", 
  "room_type": "Entire home/apt",
  "latitude": 40.7736,
  "longitude": -73.9566,
  "minimum_nights": 2,
  "availability_365": 180,
  "number_of_reviews": 50,
  "reviews_per_month": 2.5,
  "calculated_host_listings_count": 3,
  "day": 15,
  "month": 7,
  "year": 2024,
  "is_weekend": 1
}</div>
            <h4>Response:</h4>
            <div class="json">{
  "predicted_price": 234.56,
  "model_used": "ensemble",
  "confidence_level": "high",
  "individual_predictions": {
    "neural_network": 235.12,
    "random_forest": 230.45,
    "gradient_boosting": 238.90,
    "ridge": 233.78
  }
}</div>
        </div>

        <div class="endpoint">
            <h3><span class="method">POST</span> <span class="url">/predict/batch</span></h3>
            <p>Predict prices for multiple listings</p>
            <h4>Request Body:</h4>
            <div class="json">{
  "predictions": [
    {
      "neighbourhood_group": "Manhattan",
      "neighbourhood": "Upper East Side",
      "room_type": "Entire home/apt",
      ...
    },
    {
      "neighbourhood_group": "Brooklyn", 
      "neighbourhood": "Williamsburg",
      "room_type": "Private room",
      ...
    }
  ]
}</div>
        </div>

        <div class="endpoint">
            <h3><span class="method">GET</span> <span class="url">/model/info</span></h3>
            <p>Get detailed model information and capabilities</p>
        </div>

        <div class="endpoint">
            <h3><span class="method">GET</span> <span class="url">/health</span></h3>
            <p>Simple health check endpoint</p>
        </div>

        <h2>📝 Required Fields</h2>
        <ul>
            <li><strong>neighbourhood_group:</strong> Manhattan, Brooklyn, Queens, Bronx, Staten Island</li>
            <li><strong>neighbourhood:</strong> Specific neighborhood name</li>
            <li><strong>room_type:</strong> Entire home/apt, Private room, Shared room</li>
            <li><strong>latitude:</strong> Latitude coordinate (-90 to 90)</li>
            <li><strong>longitude:</strong> Longitude coordinate (-180 to 180)</li>
            <li><strong>minimum_nights:</strong> Minimum nights required (≥ 0)</li>
            <li><strong>availability_365:</strong> Days available per year (0-365)</li>
            <li><strong>number_of_reviews:</strong> Total reviews (≥ 0)</li>
            <li><strong>calculated_host_listings_count:</strong> Host's total listings (≥ 0)</li>
        </ul>

        <h2>🔧 Optional Fields</h2>
        <ul>
            <li><strong>reviews_per_month:</strong> Average reviews per month (default: 0)</li>
            <li><strong>day:</strong> Day of month (default: 15)</li>
            <li><strong>month:</strong> Month (1-12, default: 6)</li>
            <li><strong>year:</strong> Year (default: 2024)</li>
            <li><strong>is_weekend:</strong> Weekend flag (0 or 1, default: 0)</li>
        </ul>

        <h2>🎯 Example Usage</h2>
        <div class="json">curl -X POST {{ base_url }}/predict \
  -H "Content-Type: application/json" \
  -d '{
    "neighbourhood_group": "Manhattan",
    "neighbourhood": "Upper East Side",
    "room_type": "Entire home/apt",
    "latitude": 40.7736,
    "longitude": -73.9566,
    "minimum_nights": 2,
    "availability_365": 180,
    "number_of_reviews": 50,
    "calculated_host_listings_count": 3
  }'</div>
    </div>
</body>
</html>
"""

@app.route('/', methods=['GET'])
def api_documentation():
    """Serve API documentation"""
    try:
        # Get model status
        if predictor:
            model_info = predictor.get_model_info()
            status = "ONLINE"
            status_class = "online"
            model_version = model_info.get('model_version', 'unknown')
            ensemble_mode = "Yes" if model_info.get('is_ensemble', False) else "No"
            total_features = model_info.get('feature_counts', {}).get('total', 0)
        else:
            status = "OFFLINE"
            status_class = "offline"
            model_version = "unknown"
            ensemble_mode = "unknown"
            total_features = 0
        
        base_url = request.base_url.rstrip('/')
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        return render_template_string(
            API_DOCS,
            status=status,
            status_class=status_class,
            model_version=model_version,
            ensemble_mode=ensemble_mode,
            total_features=total_features,
            timestamp=timestamp,
            base_url=base_url
        )
    except Exception as e:
        logger.error(f"❌ Error serving documentation: {str(e)}")
        return jsonify({
            'error': 'Failed to load API documentation',
            'details': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    try:
        model_status = predictor is not None
        
        return jsonify({
            'status': 'healthy' if model_status else 'unhealthy',
            'timestamp': datetime.now().isoformat(),
            'model_loaded': model_status,
            'version': '1.0'
        }), 200 if model_status else 503
    except Exception as e:
        logger.error(f"❌ Health check error: {str(e)}")
        return jsonify({
            'status': 'error',
            'timestamp': datetime.now().isoformat(),
            'error': str(e)
        }), 500

@app.route('/predict', methods=['POST'])
def predict_price():
    """Single price prediction endpoint"""
    try:
        # Check if model is loaded
        if not predictor:
            return jsonify({
                'error': 'Model not loaded',
                'message': 'Prediction model is not available'
            }), 503
        
        # Get request data
        if not request.is_json:
            return jsonify({
                'error': 'Invalid content type',
                'message': 'Request must be JSON'
            }), 400
        
        data = request.get_json()
        if not data:
            return jsonify({
                'error': 'No data provided',
                'message': 'Request body is empty'
            }), 400
        
        # Validate input
        is_valid, errors = validate_prediction_input(data)
        if not is_valid:
            return jsonify({
                'error': 'Invalid input data',
                'validation_errors': errors
            }), 400
        
        # Make prediction
        logger.info(f"🎯 Making prediction for: {data.get('neighbourhood_group', 'unknown')} - {data.get('room_type', 'unknown')}")
        result = predictor.predict(data)
        
        # Check prediction result
        if result.get('predicted_price') is None:
            return jsonify({
                'error': 'Prediction failed',
                'details': result.get('error', 'Unknown error'),
                'timestamp': datetime.now().isoformat()
            }), 500
        
        # Add metadata
        result['timestamp'] = datetime.now().isoformat()
        result['api_version'] = '1.0'
        
        logger.info(f"✅ Prediction successful: ${result['predicted_price']}")
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"❌ Prediction error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'Internal server error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/predict/batch', methods=['POST'])
def predict_batch():
    """Batch prediction endpoint"""
    try:
        # Check if model is loaded
        if not predictor:
            return jsonify({
                'error': 'Model not loaded',
                'message': 'Prediction model is not available'
            }), 503
        
        # Get request data
        if not request.is_json:
            return jsonify({
                'error': 'Invalid content type',
                'message': 'Request must be JSON'
            }), 400
        
        data = request.get_json()
        if not data or 'predictions' not in data:
            return jsonify({
                'error': 'Invalid request format',
                'message': 'Request must contain "predictions" array'
            }), 400
        
        predictions_data = data['predictions']
        if not isinstance(predictions_data, list):
            return jsonify({
                'error': 'Invalid data type',
                'message': '"predictions" must be an array'
            }), 400
        
        if len(predictions_data) == 0:
            return jsonify({
                'error': 'Empty predictions array',
                'message': 'At least one prediction is required'
            }), 400
        
        if len(predictions_data) > 100:  # Limit batch size
            return jsonify({
                'error': 'Batch size too large',
                'message': 'Maximum 100 predictions per batch'
            }), 400
        
        # Validate all inputs first
        validation_errors = []
        for i, item in enumerate(predictions_data):
            is_valid, errors = validate_prediction_input(item)
            if not is_valid:
                validation_errors.append({
                    'index': i,
                    'errors': errors
                })
        
        if validation_errors:
            return jsonify({
                'error': 'Validation failed',
                'validation_errors': validation_errors
            }), 400
        
        # Make batch predictions
        logger.info(f"🎯 Making batch prediction for {len(predictions_data)} items")
        results = predictor.predict_batch(predictions_data)
        
        # Add metadata
        response = {
            'predictions': results,
            'total_count': len(results),
            'successful_count': len([r for r in results if r.get('predicted_price') is not None]),
            'failed_count': len([r for r in results if r.get('predicted_price') is None]),
            'timestamp': datetime.now().isoformat(),
            'api_version': '1.0'
        }
        
        logger.info(f"✅ Batch prediction completed: {response['successful_count']}/{response['total_count']} successful")
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"❌ Batch prediction error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'Internal server error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/model/info', methods=['GET'])
def model_info():
    """Get model information"""
    try:
        if not predictor:
            return jsonify({
                'error': 'Model not loaded',
                'message': 'Prediction model is not available'
            }), 503
        
        info = predictor.get_model_info()
        info['timestamp'] = datetime.now().isoformat()
        info['api_version'] = '1.0'
        info['server_status'] = 'online'
        
        return jsonify(info), 200
        
    except Exception as e:
        logger.error(f"❌ Model info error: {str(e)}")
        return jsonify({
            'error': 'Failed to get model information',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'error': 'Endpoint not found',
        'message': 'The requested endpoint does not exist',
        'available_endpoints': [
            'GET /',
            'GET /health',
            'POST /predict',
            'POST /predict/batch',
            'GET /model/info'
        ],
        'timestamp': datetime.now().isoformat()
    }), 404

@app.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 errors"""
    return jsonify({
        'error': 'Method not allowed',
        'message': 'The HTTP method is not allowed for this endpoint',
        'timestamp': datetime.now().isoformat()
    }), 405

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        'error': 'Internal server error',
        'message': 'An unexpected error occurred',
        'timestamp': datetime.now().isoformat()
    }), 500

def create_app():
    """Factory function to create and configure the app"""
    # Initialize predictor
    success = initialize_predictor()
    if not success:
        logger.warning("⚠️ Starting app without loaded model")
    
    return app

# Initialize predictor on module load
def _initialize_on_startup():
    """Initialize the predictor on application startup"""
    logger.info("🚀 Starting Flask application...")
    success = initialize_predictor()
    if success:
        logger.info("✅ Application startup completed successfully")
    else:
        logger.error("❌ Application startup failed - model not loaded")

# Call initialization immediately when module is loaded
_initialize_on_startup()

if __name__ == '__main__':
    print("🚀 Starting Airbnb Price Prediction API")
    print("=" * 60)
    
    # Initialize predictor
    success = initialize_predictor()
    if success:
        print("✅ Model loaded successfully")
        if predictor:
            model_info = predictor.get_model_info()
            print(f"• Model Version: {model_info.get('model_version', 'unknown')}")
            print(f"• Ensemble Mode: {model_info.get('is_ensemble', False)}")
            print(f"• Total Features: {model_info.get('feature_counts', {}).get('total', 0)}")
    else:
        print("❌ Failed to load model - starting in limited mode")
    
    print("\n📋 API Endpoints:")
    print("• GET  / - API documentation")
    print("• POST /predict - Single prediction")
    print("• POST /predict/batch - Batch predictions")
    print("• GET  /model/info - Model information")
    print("• GET  /health - Health check")
    
    # Get port from environment or use default
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    
    print(f"\n🌐 Starting server on port {port}")
    print(f"📖 Documentation: http://localhost:{port}/")
    print(f"🔧 Debug mode: {debug}")
    print("\nPress Ctrl+C to stop the server")
    print("=" * 60)
    
    try:
        app.run(
            host='0.0.0.0',
            port=port,
            debug=debug,
            threaded=True
        )
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Server error: {str(e)}")
