#!/bin/bash

echo "========================================"
echo "  EduLearn - Automatic Setup"
echo "========================================"
echo ""

echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from: https://nodejs.org/"
    echo ""
    exit 1
fi

echo "Node.js found!"
echo ""

echo "Checking if dependencies are installed..."
if [ ! -d "node_modules" ]; then
    echo "Dependencies not found. Installing..."
    echo "This may take 2-5 minutes. Please wait..."
    echo ""
    echo "Installing uuid package..."
    npm install uuid
    echo ""
    echo "Installing all dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo ""
        echo "ERROR: Installation failed!"
        echo "Please check your internet connection and try again."
        exit 1
    fi
    echo ""
    echo "Installation complete!"
else
    echo "Dependencies already installed!"
    echo "Checking for uuid package..."
    npm install uuid
fi

echo ""
echo "========================================"
echo "  Starting EduLearn..."
echo "========================================"
echo ""
echo "Backend Server: http://localhost:3001"
echo "Frontend App: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop the servers"
echo ""

npm run dev:full
