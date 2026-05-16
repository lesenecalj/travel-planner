import { Form, Input, InputNumber, Select, Button, Card, Typography, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useCreateTrip } from '../hooks/useTrips';
import type { TripInput, TravelInterest, InterestWeights } from '../types';

const { Title } = Typography;

type InterestLevel = 0 | 1 | 2 | 3;

const INTEREST_CONFIG: Record<TravelInterest, { label: string; activeClass: string }> = {
  outdoor:  { label: 'Outdoor',   activeClass: 'border-green-400 bg-green-50' },
  cultural: { label: 'Cultural',  activeClass: 'border-purple-400 bg-purple-50' },
  food:     { label: 'Food',      activeClass: 'border-orange-400 bg-orange-50' },
  leisure:  { label: 'Leisure',   activeClass: 'border-cyan-400 bg-cyan-50' },
};

const LEVEL_LABEL: Record<InterestLevel, string> = {
  0: 'Off',
  1: 'Why not',
  2: 'Interested',
  3: 'Must-do',
};

const DEFAULT_INTERESTS: InterestWeights = { outdoor: 0, cultural: 0, food: 0, leisure: 0 };

function InterestPicker({ value, onChange }: { value?: InterestWeights; onChange?: (v: InterestWeights) => void }) {
  const weights: InterestWeights = value ?? DEFAULT_INTERESTS;
  const cycle = (interest: TravelInterest) => {
    const next = ((weights[interest] + 1) % 4) as InterestLevel;
    onChange?.({ ...weights, [interest]: next });
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {(Object.entries(INTEREST_CONFIG) as [TravelInterest, typeof INTEREST_CONFIG[TravelInterest]][]).map(([interest, cfg]) => {
          const level = weights[interest] as InterestLevel;
          const active = level > 0;
          return (
            <button
              key={interest}
              type="button"
              onClick={() => cycle(interest)}
              className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer select-none
                ${active ? cfg.activeClass : 'border-gray-200 bg-gray-50 opacity-50'}`}
            >
              <div className="flex justify-between items-start">
                <div className="font-semibold text-sm">{cfg.label}</div>
                <div className="flex gap-1 mt-0.5">
                  {([1, 2, 3] as InterestLevel[]).map((l) => (
                    <span
                      key={l}
                      className={`w-2 h-2 rounded-full ${level >= l ? 'bg-gray-600' : 'bg-gray-200'}`}
                    />
                  ))}
                </div>
              </div>
              <div className={`text-xs mt-1 ${active ? 'font-medium' : 'text-gray-400'}`}>
                {LEVEL_LABEL[level]}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

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
            label="Interests"
            name="interests"
            tooltip="Click to cycle: Why not → Interested → Must-do → Off"
            initialValue={DEFAULT_INTERESTS}
            rules={[{
              validator: (_: unknown, value: InterestWeights) =>
                Object.values(value ?? {}).some((v) => v > 0)
                  ? Promise.resolve()
                  : Promise.reject(new Error('Select at least one interest')),
            }]}
          >
            <InterestPicker />
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
