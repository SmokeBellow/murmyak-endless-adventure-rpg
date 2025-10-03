import { DarkForestLootTable } from '@/components/DarkForestLootTable';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LootTable() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад в игру
        </Button>
        
        <DarkForestLootTable />
      </div>
    </div>
  );
}
