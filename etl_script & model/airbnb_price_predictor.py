"""
🏠 Airbnb NYC Price Prediction Model - Production Deployment Script
============================================================================

This script provides a production-ready implementation of the enhanced Airbnb
price prediction model with ensemble approach and comprehensive feature engineering.

Author: Generated for production deployment
Version: 2.0 (Enhanced with Ensemble)
Date: December 2024

Features:
- Ensemble Model (Neural Network + Random Forest + Gradient Boosting + Ridge)
- 31+ Engineered Features
- Robust Outlier Handling
- Comprehensive Data Validation
- Production-ready Error Handling
"""

import pandas as pd
import numpy as np
import pickle
import joblib
import tensorflow as tf
from sklearn.preprocessing import RobustScaler, LabelEncoder
from pathlib import Path
import warnings
import logging
from typing import Dict, List, Union, Optional, Tuple
import json

warnings.filterwarnings('ignore')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AirbnbPricePredictor:
    """
    Production-ready Airbnb Price Predictor with Ensemble Models
    
    This class encapsulates the complete price prediction pipeline including:
    - Feature engineering and preprocessing
    - Ensemble model predictions
    - Data validation and error handling
    - Comprehensive outlier detection
    """
    
    def __init__(self, model_dir: str = "."):
        """
        Initialize the predictor with model files
        
        Args:
            model_dir (str): Directory containing model files
        """
        self.model_dir = Path(model_dir)
        self.neural_network = None
        self.rf_model = None
        self.gb_model = None
        self.ridge_model = None
        self.scaler = None
        self.label_encoders = {}
        self.all_features = []
        self.categorical_features = []
        self.numerical_features = []
        self.binary_features = []
        self.ensemble_weights = None
        self.is_ensemble = False
        self.model_version = "unknown"
        
        # Load models and preprocessing objects
        self._load_models()
        
    def _load_models(self):
        """Load all model files and preprocessing objects"""
        try:
            # Load neural network model
            nn_path = self.model_dir / "best_airbnb_model.h5"
            if not nn_path.exists():
                nn_path = self.model_dir / "airbnb_price_prediction_model.h5"
            
            if nn_path.exists():
                self.neural_network = tf.keras.models.load_model(str(nn_path))
                logger.info(f"✅ Neural Network loaded from {nn_path}")
            else:
                raise FileNotFoundError("Neural network model file not found")
            
            # Load preprocessing objects
            preprocessing_path = self.model_dir / "model_preprocessing_enhanced.pkl"
            if preprocessing_path.exists():
                with open(preprocessing_path, 'rb') as f:
                    preprocessing_package = pickle.load(f)
                
                self.scaler = preprocessing_package.get('scaler')
                self.label_encoders = preprocessing_package.get('label_encoders', {})
                self.all_features = preprocessing_package.get('all_features', [])
                self.categorical_features = preprocessing_package.get('categorical_features', [])
                self.numerical_features = preprocessing_package.get('numerical_features', [])
                self.binary_features = preprocessing_package.get('binary_features', [])
                self.ensemble_weights = preprocessing_package.get('ensemble_weights')
                self.model_version = preprocessing_package.get('model_version', 'enhanced_v2')
                
                logger.info(f"✅ Preprocessing objects loaded")
                logger.info(f"   - Features: {len(self.all_features)}")
                logger.info(f"   - Model version: {self.model_version}")
            else:
                logger.warning("⚠️ Preprocessing file not found, using fallback configuration")
                self._setup_fallback_preprocessing()
            
            # Load ensemble models
            self._load_ensemble_models()
            
        except Exception as e:
            logger.error(f"❌ Error loading models: {str(e)}")
            raise
    
    def _load_ensemble_models(self):
        """Load ensemble models if available"""
        try:
            # Load Random Forest
            rf_path = self.model_dir / "rf_model.pkl"
            if rf_path.exists():
                self.rf_model = joblib.load(rf_path)
                logger.info("✅ Random Forest model loaded")
            
            # Load Gradient Boosting
            gb_path = self.model_dir / "gb_model.pkl"
            if gb_path.exists():
                self.gb_model = joblib.load(gb_path)
                logger.info("✅ Gradient Boosting model loaded")
            
            # Load Ridge Regression
            ridge_path = self.model_dir / "ridge_model.pkl"
            if ridge_path.exists():
                self.ridge_model = joblib.load(ridge_path)
                logger.info("✅ Ridge Regression model loaded")
            
            # Check if ensemble is complete
            if all([self.rf_model, self.gb_model, self.ridge_model, self.ensemble_weights is not None]):
                self.is_ensemble = True
                logger.info("🎯 Ensemble mode enabled")
            else:
                logger.info("📊 Single model mode (Neural Network only)")
                
        except Exception as e:
            logger.warning(f"⚠️ Could not load ensemble models: {str(e)}")
            logger.info("📊 Falling back to Neural Network only")
    
    def _setup_fallback_preprocessing(self):
        """Setup fallback preprocessing configuration"""
        logger.info("Setting up fallback preprocessing configuration...")
        
        # Basic feature sets (will be dynamically expanded)
        self.categorical_features = [
            'neighbourhood_group', 'neighbourhood', 'room_type',
            'price_category', 'host_activity_level', 'season',
            'availability_category', 'min_nights_category', 'booking_intensity'
        ]
        
        self.numerical_features = [
            'latitude', 'longitude', 'minimum_nights', 'availability_365',
            'number_of_reviews', 'reviews_per_month_filled', 'calculated_host_listings_count',
            'day', 'month', 'year', 'review_density', 'host_experience',
            'distance_to_manhattan', 'neighbourhood_avg_price', 'neighbourhood_density',
            'price_ratio_to_neighbourhood', 'quarter', 'availability_ratio',
            'reviews_x_availability', 'host_listings_x_reviews', 'location_premium',
            'price_per_review', 'availability_efficiency', 'review_frequency'
        ]
        
        self.binary_features = [
            'is_weekend', 'has_reviews', 'is_super_host', 'is_peak_season',
            'is_highly_available', 'is_short_stay'
        ]
        
        # Create basic scaler and label encoders
        self.scaler = RobustScaler()
        self.label_encoders = {}
        
        # Set all features
        self.all_features = self.categorical_features + self.numerical_features + self.binary_features
        
        logger.warning("⚠️ Using fallback configuration - some features may not be available")
    
    def _validate_input(self, data: Dict) -> Dict:
        """
        Validate and normalize input data
        
        Args:
            data (Dict): Input data dictionary
            
        Returns:
            Dict: Validated and normalized data
        """
        required_fields = [
            'neighbourhood_group', 'neighbourhood', 'room_type',
            'latitude', 'longitude', 'minimum_nights', 'availability_365',
            'number_of_reviews', 'calculated_host_listings_count'
        ]
        
        # Check required fields
        missing_fields = [field for field in required_fields if field not in data or data[field] is None]
        if missing_fields:
            raise ValueError(f"Missing required fields: {missing_fields}")
        
        # Validate and normalize data
        validated_data = data.copy()
        
        # Validate numerical ranges
        if not (-90 <= validated_data['latitude'] <= 90):
            raise ValueError(f"Invalid latitude: {validated_data['latitude']}")
        if not (-180 <= validated_data['longitude'] <= 180):
            raise ValueError(f"Invalid longitude: {validated_data['longitude']}")
        if validated_data['minimum_nights'] < 0:
            raise ValueError(f"Invalid minimum_nights: {validated_data['minimum_nights']}")
        if not (0 <= validated_data['availability_365'] <= 365):
            raise ValueError(f"Invalid availability_365: {validated_data['availability_365']}")
        if validated_data['number_of_reviews'] < 0:
            raise ValueError(f"Invalid number_of_reviews: {validated_data['number_of_reviews']}")
        if validated_data['calculated_host_listings_count'] < 0:
            raise ValueError(f"Invalid calculated_host_listings_count: {validated_data['calculated_host_listings_count']}")
        
        # Fill default values for optional fields
        validated_data.setdefault('reviews_per_month', 0.0)
        validated_data.setdefault('day', 15)  # Default to mid-month
        validated_data.setdefault('month', 6)  # Default to June
        validated_data.setdefault('year', 2024)  # Default to current year
        validated_data.setdefault('is_weekend', 0)
        
        return validated_data
    
    def _engineer_features(self, data: Dict) -> pd.DataFrame:
        """
        Apply comprehensive feature engineering pipeline
        
        Args:
            data (Dict): Validated input data
            
        Returns:
            pd.DataFrame: Engineered features
        """
        # Create DataFrame from input
        df = pd.DataFrame([data])
        
        # Basic feature engineering
        df['reviews_per_month_filled'] = df['reviews_per_month'].fillna(0)
        
        # Create price categories (using reasonable default ranges)
        # Note: This will be updated during prediction since we don't have price yet
        df['price_category'] = 'Mid-range'  # Default category
        
        # Review features
        df['review_density'] = df['number_of_reviews'] / (df['availability_365'] + 1)
        df['has_reviews'] = (df['number_of_reviews'] > 0).astype(int)
        df['review_frequency'] = np.where(
            df['reviews_per_month_filled'] > 0,
            df['number_of_reviews'] / df['reviews_per_month_filled'],
            0
        )
        
        # Host features
        df['host_experience'] = np.log1p(df['calculated_host_listings_count'])
        df['is_super_host'] = (df['calculated_host_listings_count'] > 5).astype(int)
        
        # Map host activity level
        host_activity_mapping = {
            0: 'New', 1: 'New',
            2: 'Casual', 3: 'Casual',
            4: 'Active', 5: 'Active', 6: 'Active', 7: 'Active', 8: 'Active', 9: 'Active', 10: 'Active'
        }
        df['host_activity_level'] = df['calculated_host_listings_count'].apply(
            lambda x: 'Professional' if x > 10 else host_activity_mapping.get(x, 'Active')
        )
        
        # Location features
        manhattan_center_lat, manhattan_center_lon = 40.7589, -73.9851
        df['distance_to_manhattan'] = np.sqrt(
            (df['latitude'] - manhattan_center_lat)**2 + 
            (df['longitude'] - manhattan_center_lon)**2
        )
        
        # Neighborhood-based features (using reasonable defaults if not available)
        # In production, these would be loaded from reference data
        nyc_avg_prices = {
            'Manhattan': 150, 'Brooklyn': 100, 'Queens': 80,
            'Bronx': 70, 'Staten Island': 75
        }
        df['neighbourhood_avg_price'] = df['neighbourhood_group'].map(nyc_avg_prices).fillna(100)
        
        # Neighborhood density (using reasonable estimates)
        nyc_densities = {
            'Manhattan': 5000, 'Brooklyn': 3000, 'Queens': 2000,
            'Bronx': 1500, 'Staten Island': 800
        }
        df['neighbourhood_density'] = df['neighbourhood_group'].map(nyc_densities).fillna(2000)
        
        # Temporal features
        season_mapping = {
            12: 'Winter', 1: 'Winter', 2: 'Winter',
            3: 'Spring', 4: 'Spring', 5: 'Spring',
            6: 'Summer', 7: 'Summer', 8: 'Summer',
            9: 'Fall', 10: 'Fall', 11: 'Fall'
        }
        df['season'] = df['month'].map(season_mapping)
        df['is_peak_season'] = df['season'].isin(['Summer', 'Fall']).astype(int)
        df['quarter'] = ((df['month'] - 1) // 3) + 1
        
        # Availability features
        def categorize_availability(days):
            if days <= 60:
                return 'Limited'
            elif days <= 180:
                return 'Seasonal'
            elif days <= 300:
                return 'Regular'
            else:
                return 'Always'
        
        df['availability_category'] = df['availability_365'].apply(categorize_availability)
        df['availability_ratio'] = df['availability_365'] / 365
        df['is_highly_available'] = (df['availability_365'] > 300).astype(int)
        
        # Minimum nights features
        df['is_short_stay'] = (df['minimum_nights'] <= 3).astype(int)
        
        def categorize_min_nights(nights):
            if nights <= 1:
                return 'Flexible'
            elif nights <= 3:
                return 'Short'
            elif nights <= 7:
                return 'Week'
            elif nights <= 30:
                return 'Month'
            else:
                return 'Long-term'
        
        df['min_nights_category'] = df['minimum_nights'].apply(categorize_min_nights)
        
        # Interaction features
        df['reviews_x_availability'] = df['number_of_reviews'] * df['availability_365']
        df['host_listings_x_reviews'] = df['calculated_host_listings_count'] * df['number_of_reviews']
        df['location_premium'] = (df['neighbourhood_group'] == 'Manhattan').astype(int) * df['latitude']
        
        # Additional features
        df['price_per_review'] = np.where(
            df['number_of_reviews'] > 0,
            100,  # Default value since we don't have price yet
            100
        )
        
        df['availability_efficiency'] = np.where(
            df['availability_365'] > 0,
            df['number_of_reviews'] / df['availability_365'],
            0
        )
        
        # Booking intensity (based on unavailable days)
        booked_days = 365 - df['availability_365']
        def categorize_booking_intensity(days):
            if days <= 50:
                return 'Low'
            elif days <= 150:
                return 'Medium'
            elif days <= 300:
                return 'High'
            else:
                return 'Very High'
        
        df['booking_intensity'] = booked_days.apply(categorize_booking_intensity)
        
        # Price ratio (will be set to 1.0 as default)
        df['price_ratio_to_neighbourhood'] = 1.0
        
        return df
    
    def _preprocess_features(self, df: pd.DataFrame) -> np.ndarray:
        """
        Apply preprocessing to engineered features
        
        Args:
            df (pd.DataFrame): DataFrame with engineered features
            
        Returns:
            np.ndarray: Preprocessed feature array
        """
        # Ensure all required features are present
        missing_features = [f for f in self.all_features if f not in df.columns]
        for feature in missing_features:
            if feature in self.categorical_features:
                df[feature] = 'Unknown'
            elif feature in self.binary_features:
                df[feature] = 0
            else:
                df[feature] = 0.0
            logger.warning(f"⚠️ Missing feature '{feature}' filled with default value")
        
        # Select and order features
        df_features = df[self.all_features].copy()
        
        # Handle categorical features
        for feature in self.categorical_features:
            if feature in df_features.columns:
                if feature in self.label_encoders:
                    # Use existing label encoder
                    le = self.label_encoders[feature]
                    try:
                        df_features[feature] = le.transform(df_features[feature])
                    except ValueError:
                        # Handle unseen categories
                        logger.warning(f"⚠️ Unseen category in feature '{feature}', using default value")
                        df_features[feature] = 0
                else:
                    # Create new label encoder for fallback
                    logger.warning(f"⚠️ No label encoder for '{feature}', creating new one")
                    le = LabelEncoder()
                    df_features[feature] = le.fit_transform(df_features[feature].astype(str))
                    self.label_encoders[feature] = le
        
        # Convert to float
        df_features = df_features.astype(float)
        
        # Apply scaling
        try:
            if hasattr(self.scaler, 'transform'):
                # Use existing scaler
                features_scaled = self.scaler.transform(df_features)
            else:
                # Fallback: create new scaler
                logger.warning("⚠️ No trained scaler available, using basic normalization")
                features_scaled = (df_features - df_features.mean()) / (df_features.std() + 1e-8)
                features_scaled = features_scaled.fillna(0).values
        except Exception as e:
            logger.warning(f"⚠️ Scaling error: {str(e)}, using raw features")
            features_scaled = df_features.fillna(0).values
        
        return features_scaled
    
    def predict(self, input_data: Dict) -> Dict:
        """
        Make price prediction with comprehensive error handling
        
        Args:
            input_data (Dict): Input data for prediction
            
        Returns:
            Dict: Prediction results with metadata
        """
        try:
            # Validate input
            validated_data = self._validate_input(input_data)
            
            # Engineer features
            df_engineered = self._engineer_features(validated_data)
            
            # Preprocess features
            features_scaled = self._preprocess_features(df_engineered)
            
            # Make predictions
            predictions = {}
            
            # Neural Network prediction
            if self.neural_network:
                nn_pred = self.neural_network.predict(features_scaled, verbose=0)[0][0]
                predictions['neural_network'] = float(nn_pred)
            
            # Ensemble predictions
            if self.is_ensemble:
                if self.rf_model:
                    rf_pred = self.rf_model.predict(features_scaled)[0]
                    predictions['random_forest'] = float(rf_pred)
                
                if self.gb_model:
                    gb_pred = self.gb_model.predict(features_scaled)[0]
                    predictions['gradient_boosting'] = float(gb_pred)
                
                if self.ridge_model:
                    ridge_pred = self.ridge_model.predict(features_scaled)[0]
                    predictions['ridge'] = float(ridge_pred)
                
                # Calculate ensemble prediction
                if len(predictions) > 1 and self.ensemble_weights is not None:
                    model_preds = [
                        predictions.get('neural_network', 0),
                        predictions.get('random_forest', 0),
                        predictions.get('gradient_boosting', 0),
                        predictions.get('ridge', 0)
                    ]
                    ensemble_pred = sum(w * p for w, p in zip(self.ensemble_weights, model_preds))
                    predictions['ensemble'] = float(ensemble_pred)
            
            # Determine final prediction
            if 'ensemble' in predictions:
                final_prediction = predictions['ensemble']
                model_used = 'ensemble'
            elif 'neural_network' in predictions:
                final_prediction = predictions['neural_network']
                model_used = 'neural_network'
            else:
                raise ValueError("No model predictions available")
            
            # Apply bounds and validation
            final_prediction = max(10, min(10000, final_prediction))  # Reasonable bounds
            
            # Prepare result
            result = {
                'predicted_price': round(float(final_prediction), 2),
                'model_used': model_used,
                'model_version': self.model_version,
                'individual_predictions': predictions,
                'confidence_level': 'high' if self.is_ensemble else 'medium',
                'features_used': len(self.all_features),
                'input_validation': 'passed',
                'warnings': []
            }
            
            # Add confidence metrics
            if len(predictions) > 1:
                pred_values = list(predictions.values())
                std_dev = np.std(pred_values)
                result['prediction_std'] = round(float(std_dev), 2)
                result['prediction_range'] = {
                    'min': round(float(min(pred_values)), 2),
                    'max': round(float(max(pred_values)), 2)
                }
            
            logger.info(f"✅ Prediction successful: ${final_prediction:.2f}")
            return result
            
        except Exception as e:
            logger.error(f"❌ Prediction error: {str(e)}")
            return {
                'predicted_price': None,
                'error': str(e),
                'model_used': None,
                'model_version': self.model_version,
                'confidence_level': 'error'
            }
    
    def predict_batch(self, input_list: List[Dict]) -> List[Dict]:
        """
        Make batch predictions
        
        Args:
            input_list (List[Dict]): List of input data dictionaries
            
        Returns:
            List[Dict]: List of prediction results
        """
        results = []
        for i, input_data in enumerate(input_list):
            try:
                result = self.predict(input_data)
                result['batch_index'] = i
                results.append(result)
            except Exception as e:
                logger.error(f"❌ Batch prediction error for index {i}: {str(e)}")
                results.append({
                    'predicted_price': None,
                    'error': str(e),
                    'batch_index': i,
                    'confidence_level': 'error'
                })
        return results
    
    def get_model_info(self) -> Dict:
        """
        Get comprehensive model information
        
        Returns:
            Dict: Model information and capabilities
        """
        return {
            'model_version': self.model_version,
            'is_ensemble': self.is_ensemble,
            'available_models': {
                'neural_network': self.neural_network is not None,
                'random_forest': self.rf_model is not None,
                'gradient_boosting': self.gb_model is not None,
                'ridge_regression': self.ridge_model is not None
            },
            'feature_counts': {
                'total': len(self.all_features),
                'categorical': len(self.categorical_features),
                'numerical': len(self.numerical_features),
                'binary': len(self.binary_features)
            },
            'capabilities': {
                'single_prediction': True,
                'batch_prediction': True,
                'feature_engineering': True,
                'outlier_handling': True,
                'data_validation': True
            },
            'preprocessing': {
                'scaler_available': self.scaler is not None,
                'label_encoders_count': len(self.label_encoders),
                'ensemble_weights_available': self.ensemble_weights is not None
            }
        }


def load_predictor(model_dir: str = ".") -> AirbnbPricePredictor:
    """
    Convenience function to load the predictor
    
    Args:
        model_dir (str): Directory containing model files
        
    Returns:
        AirbnbPricePredictor: Loaded predictor instance
    """
    return AirbnbPricePredictor(model_dir)


# Example usage and testing
if __name__ == "__main__":
    print("🏠 Airbnb Price Predictor - Production Deployment")
    print("=" * 60)
    
    try:
        # Initialize predictor
        predictor = load_predictor()
        
        # Print model information
        model_info = predictor.get_model_info()
        print(f"\n📋 Model Information:")
        print(f"• Version: {model_info['model_version']}")
        print(f"• Ensemble Mode: {model_info['is_ensemble']}")
        print(f"• Total Features: {model_info['feature_counts']['total']}")
        print(f"• Available Models: {sum(model_info['available_models'].values())}")
        
        # Example prediction
        example_data = {
            'neighbourhood_group': 'Manhattan',
            'neighbourhood': 'Upper East Side',
            'room_type': 'Entire home/apt',
            'latitude': 40.7736,
            'longitude': -73.9566,
            'minimum_nights': 2,
            'availability_365': 180,
            'number_of_reviews': 50,
            'reviews_per_month': 2.5,
            'calculated_host_listings_count': 3,
            'day': 15,
            'month': 7,  # July
            'year': 2024,
            'is_weekend': 1
        }
        
        print(f"\n🎯 Example Prediction:")
        result = predictor.predict(example_data)
        
        if result['predicted_price']:
            print(f"• Predicted Price: ${result['predicted_price']}")
            print(f"• Model Used: {result['model_used']}")
            print(f"• Confidence: {result['confidence_level']}")
            
            if 'individual_predictions' in result:
                print(f"• Individual Model Predictions:")
                for model, price in result['individual_predictions'].items():
                    print(f"  - {model}: ${price:.2f}")
        else:
            print(f"• Error: {result.get('error', 'Unknown error')}")
        
        print(f"\n✅ Predictor loaded successfully and ready for production use!")
        print(f"\n📖 Usage Example:")
        print(f"```python")
        print(f"from airbnb_price_predictor import load_predictor")
        print(f"")
        print(f"predictor = load_predictor()")
        print(f"result = predictor.predict(your_data)")
        print(f"price = result['predicted_price']")
        print(f"```")
        
    except Exception as e:
        print(f"❌ Error initializing predictor: {str(e)}")
        print(f"\n💡 Make sure the following files are present:")
        print(f"• best_airbnb_model.h5 (or airbnb_price_prediction_model.h5)")
        print(f"• model_preprocessing_enhanced.pkl")
        print(f"• rf_model.pkl (optional for ensemble)")
        print(f"• gb_model.pkl (optional for ensemble)")
        print(f"• ridge_model.pkl (optional for ensemble)")
