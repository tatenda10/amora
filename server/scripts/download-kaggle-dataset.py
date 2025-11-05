#!/usr/bin/env python3
"""
Download Kaggle dataset: projjal1/human-conversation-training-data
"""

import kagglehub
import os
import json
import sys

def download_kaggle_dataset():
    try:
        print("📥 Downloading Kaggle dataset: projjal1/human-conversation-training-data")
        
        # Download the dataset
        path = kagglehub.dataset_download("projjal1/human-conversation-training-data")
        
        print(f"✅ Dataset downloaded to: {path}")
        
        # List files in the dataset
        if os.path.exists(path):
            files = os.listdir(path)
            print(f"📁 Files in dataset: {files}")
            
            # Look for JSON files
            json_files = [f for f in files if f.endswith('.json')]
            if json_files:
                print(f"📄 JSON files found: {json_files}")
                
                # Process the first JSON file as an example
                if json_files:
                    json_path = os.path.join(path, json_files[0])
                    with open(json_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    print(f"📊 Sample data from {json_files[0]}:")
                    if isinstance(data, list) and len(data) > 0:
                        print(f"   - Number of items: {len(data)}")
                        print(f"   - First item keys: {list(data[0].keys()) if isinstance(data[0], dict) else 'Not a dict'}")
                    elif isinstance(data, dict):
                        print(f"   - Top-level keys: {list(data.keys())}")
        
        return path
        
    except Exception as e:
        print(f"❌ Error downloading dataset: {e}")
        return None

if __name__ == "__main__":
    download_kaggle_dataset()
