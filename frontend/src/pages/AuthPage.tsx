import { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Tabs } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { login, register } from '../lib/tripApi';
import { useAuth } from '../contexts/AuthContext';

const { Title } = Typography;

type LoginForm = { email: string; password: string };
type RegisterForm = { name: string; email: string; password: string; confirm: string };

function LoginTab() {
  const { login: setTokens } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    setError(null);
    try {
      const tokens = await login(values.email, values.password);
      setTokens(tokens);
      navigate('/');
    } catch {
      setError('Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && <Alert type="error" message={error} className="mb-4" />}
      <Form layout="vertical" onFinish={onFinish} autoComplete="off">
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, type: 'email', message: 'Email invalide' }]}
        >
          <Input autoFocus />
        </Form.Item>
        <Form.Item
          label="Mot de passe"
          name="password"
          rules={[{ required: true, message: 'Mot de passe requis' }]}
        >
          <Input.Password />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={loading}>
          Se connecter
        </Button>
      </Form>
    </>
  );
}

function RegisterTab() {
  const { login: setTokens } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: RegisterForm) => {
    setLoading(true);
    setError(null);
    try {
      await register(values.name, values.email, values.password);
      const tokens = await login(values.email, values.password);
      setTokens(tokens);
      navigate('/');
    } catch (e: unknown) {
      const serverMsg: string = axios.isAxiosError(e) ? (e.response?.data?.error ?? '') : '';
      setError(serverMsg.includes('already') ? 'Cet email est déjà utilisé.' : 'Erreur lors de la création du compte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && <Alert type="error" message={error} className="mb-4" />}
      <Form layout="vertical" onFinish={onFinish} autoComplete="off">
        <Form.Item
          label="Nom"
          name="name"
          rules={[{ required: true, message: 'Nom requis' }]}
        >
          <Input autoFocus />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, type: 'email', message: 'Email invalide' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Mot de passe"
          name="password"
          rules={[{ required: true, min: 8, message: 'Minimum 8 caractères' }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label="Confirmer le mot de passe"
          name="confirm"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Confirmation requise' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) return Promise.resolve();
                return Promise.reject(new Error('Les mots de passe ne correspondent pas'));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={loading}>
          Créer un compte
        </Button>
      </Form>
    </>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-sm shadow-md">
        <Title level={3} className="text-center mb-2">
          ✈️ Travel Planner
        </Title>
        <Tabs
          defaultActiveKey="login"
          centered
          items={[
            { key: 'login', label: 'Connexion', children: <LoginTab /> },
            { key: 'register', label: 'Créer un compte', children: <RegisterTab /> },
          ]}
        />
      </Card>
    </div>
  );
}
