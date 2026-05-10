import { Layout, Button, Spin, theme } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Header, Content } = Layout;

export default function AppLayout() {
  const { isAuthenticated, isRestoring, logout } = useAuth();
  const { token } = theme.useToken();

  if (isRestoring) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <Layout className="min-h-screen">
      <Header
        style={{
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
        className="flex items-center justify-between px-6"
      >
        <span className="font-semibold text-lg">✈️ Travel Planner</span>
        <Button icon={<LogoutOutlined />} type="text" onClick={logout}>
          Déconnexion
        </Button>
      </Header>
      <Content className="p-4">
        <Outlet />
      </Content>
    </Layout>
  );
}
