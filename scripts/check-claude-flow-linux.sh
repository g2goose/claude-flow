#!/bin/bash
# Claude-Flow Linux System Check Script

echo "🔍 Claude-Flow System Check"
echo "=========================="

# Check Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js: $(node --version)"
else
    echo "❌ Node.js: Not installed"
fi

# Check npm
if command -v npm &> /dev/null; then
    echo "✅ npm: $(npm --version)"
else
    echo "❌ npm: Not installed"
fi

# Check npx
if command -v npx &> /dev/null; then
    echo "✅ npx: Available"
else
    echo "❌ npx: Not available"
fi

# Check Claude-Flow
if command -v npx &> /dev/null; then
    CLAUDE_VERSION=$(npx claude-flow@alpha --version 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo "✅ Claude-Flow: $CLAUDE_VERSION"
    else
        echo "❌ Claude-Flow: Not available"
    fi
else
    echo "❌ Claude-Flow: npx not available"
fi

# Check system resources
echo "📊 System Resources:"
echo "   Memory: $(free -h | grep '^Mem:' | awk '{print $3 "/" $2}')"
echo "   Disk: $(df -h . | tail -1 | awk '{print $3 "/" $2}')"
echo "   CPU: $(nproc) cores"
echo "   Architecture: $(uname -m)"

# Check build tools
if command -v gcc &> /dev/null; then
    echo "✅ Build tools: gcc available"
else
    echo "⚠️  Build tools: gcc not found (may cause issues with native modules)"
fi

# Check Python
if command -v python3 &> /dev/null; then
    echo "✅ Python: $(python3 --version)"
else
    echo "⚠️  Python: Not found (may cause issues with native modules)"
fi

echo "=========================="
echo "🚀 System check complete!"

# Suggest next steps
if ! command -v node &> /dev/null; then
    echo ""
    echo "📋 Next Steps:"
    echo "1. Install Node.js 20.x (see Linux installation guide)"
elif ! npx claude-flow@alpha --version &> /dev/null 2>&1; then
    echo ""
    echo "📋 Next Steps:"
    echo "1. Run: npx claude-flow@alpha init --force"
    echo "2. Try: npx claude-flow@alpha swarm \"hello world\""
else
    echo ""
    echo "🎉 Ready to use Claude-Flow!"
    echo "📋 Try these commands:"
    echo "   npx claude-flow@alpha init --force"
    echo "   npx claude-flow@alpha status"
    echo "   npx claude-flow@alpha swarm \"create a simple script\""
fi