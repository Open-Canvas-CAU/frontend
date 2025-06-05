import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto px-8 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="text-2xl text-red-600">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800">죄송합니다. 문제가 발생했습니다.</h2>
            <p className="text-gray-600">잠시 후 다시 시도해주세요.</p>
            <button 
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null })
                window.location.reload()
              }}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              다시 시도
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 p-4 bg-gray-100 rounded-lg">
                <summary className="cursor-pointer text-gray-700">에러 상세 정보</summary>
                <pre className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                  {this.state.error && this.state.error.toString()}
                  {'\n'}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary 