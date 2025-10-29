interface LoadingScreenProps {
  message?: string;
  progress?: number;
}

const LoadingScreen = ({ message = "Переход между локациями..." }: LoadingScreenProps) => {
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center">
      <div className="text-center">
        <img 
          src="/loading.png" 
          alt="Loading" 
          className="w-32 h-32 mx-auto mb-6 animate-pulse"
        />
        <p className="text-foreground text-2xl font-semibold mb-4">{message}</p>
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