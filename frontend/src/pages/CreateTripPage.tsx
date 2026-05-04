import { Form, Input, InputNumber, Select, Button, Card, Typography, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useCreateTrip } from '../hooks/useTrips';
import type { TripInput } from '../types';

const { Title } = Typography;

const INTEREST_OPTIONS = [
  'histoire', 'gastronomie', 'nature', 'art', 'architecture',
  'plages', 'randonnée', 'nightlife', 'shopping', 'sport',
];

export default function CreateTripPage() {
  const navigate = useNavigate();
  const { mutate, isPending, error } = useCreateTrip();

  const onFinish = (values: TripInput) => {
    mutate(values, { onSuccess: (trip) => navigate(`/trips/${trip.id}`) });
  };

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      <Title level={2}>Planifier un voyage</Title>

      {error && (
        <Alert
          type="error"
          message="Échec de la génération. Veuillez réessayer."
          className="mb-4"
        />
      )}

      <Card>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Destination"
            name="destination"
            rules={[{ required: true, message: 'Où allez-vous ?' }]}
          >
            <Input placeholder="ex. Japon" autoFocus />
          </Form.Item>

          <Form.Item
            label="Durée (semaines)"
            name="durationWeeks"
            initialValue={2}
            rules={[{ required: true }]}
          >
            <InputNumber min={1} max={8} className="w-full" />
          </Form.Item>

          <Form.Item label="Rythme" name="pace" initialValue="normal" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'slow', label: 'Lent — visites détendues' },
                { value: 'normal', label: 'Normal — équilibré' },
                { value: 'fast', label: 'Rapide — programme chargé' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Centres d'intérêt"
            name="interests"
            rules={[{ required: true, type: 'array', min: 1, message: 'Choisissez au moins un' }]}
          >
            <Select
              mode="multiple"
              placeholder="Sélectionnez vos intérêts"
              options={INTEREST_OPTIONS.map((i) => ({ value: i, label: i }))}
            />
          </Form.Item>

          <Form.Item label="Libellé (optionnel)" name="label">
            <Input placeholder="ex. Voyage de noces" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={isPending}>
            {isPending ? 'Génération en cours…' : 'Générer le plan'}
          </Button>
        </Form>
      </Card>
    </div>
  );
}
