interface LoadingScreenProps {
  message?: string;
  progress?: number;
}

const LoadingScreen = ({ message = "Переход между локациями...", progress }: LoadingScreenProps) => {
  // Debug logging
  console.log('LoadingScreen render - progress:', progress, 'message:', message);
  
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-6"></div>
        <p className="text-foreground text-2xl font-semibold mb-4">{message}</p>
        {progress !== undefined && (
          <div className="w-80 max-w-full mx-auto">
            <div className="w-full bg-muted rounded-full h-3 mb-3">
              <div 
                className="bg-primary h-3 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-muted-foreground text-lg" key={progress}>{Math.round(progress)}%</p>
          </div>
        )}
        <div className="flex justify-center space-x-2 mt-6">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;