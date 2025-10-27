import { Card, CardContent } from '@/components/ui/card';

interface LoadingScreenProps {
  message?: string;
  progress?: number;
}

const LoadingScreen = ({ message = "Переход между локациями...", progress }: LoadingScreenProps) => {
  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-foreground text-lg">{message}</p>
          {progress !== undefined && (
            <div className="mt-4">
              <div className="w-full bg-muted rounded-full h-2.5 mb-2">
                <div 
                  className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-muted-foreground text-sm">{progress}%</p>
            </div>
          )}
          <div className="flex justify-center space-x-1 mt-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingScreen;