# scripts/predict_water_quality.py

import sys
import json

def predict_water_quality(coliform, turbidity, bod, cod, nitrate, ammonia):
    try:
        # For now, let's create a simple rule-based prediction for testing
        # You can replace this with your actual model loading and prediction
        
        # Simple scoring system for testing
        score = 0
        
        if coliform > 1000:
            score += 3
        elif coliform > 100:
            score += 2
        elif coliform > 0:
            score += 1
                
        if turbidity > 10:
            score += 2
        if bod > 5:
            score += 2
        if cod > 10:
            score += 2
        if nitrate > 50:
            score += 2
        if ammonia > 1:
            score += 2
        
        # Determine risk level
        if score <= 3:
            risk_level = 'low'
            probability = 0.3
        elif score <= 6:
            risk_level = 'moderate' 
            probability = 0.6
        else:
            risk_level = 'high'
            probability = 0.9
            
        result = {
            'risk_level': risk_level,
            'probability': probability,
            'confidence': 0.85,
            'status': 'success'
        }
        
        return result
        
    except Exception as e:
        return {
            'error': f'Prediction failed: {str(e)}',
            'status': 'error'
        }

if __name__ == '__main__':
    if len(sys.argv) != 7:
        result = {
            'error': 'Invalid number of arguments. Expected: coliform turbidity bod cod nitrate ammonia',
            'status': 'error'
        }
        print(json.dumps(result))
        sys.exit(1)
    
    try:
        # Parse command line arguments
        coliform = float(sys.argv[1])
        turbidity = float(sys.argv[2])
        bod = float(sys.argv[3])
        cod = float(sys.argv[4])
        nitrate = float(sys.argv[5])
        ammonia = float(sys.argv[6])
        
        # Make prediction
        result = predict_water_quality(coliform, turbidity, bod, cod, nitrate, ammonia)
        
        # Output result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        result = {
            'error': f'Unexpected error: {str(e)}',
            'status': 'error'
        }
        print(json.dumps(result))
        sys.exit(1)