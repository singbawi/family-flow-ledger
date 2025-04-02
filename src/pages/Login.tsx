
import React from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => navigate('/')}
        className="mb-4"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-3xl font-bold text-center mb-8">Family Finance Tracker</h1>
      <LoginForm />
    </div>
  );
};

export default Login;
