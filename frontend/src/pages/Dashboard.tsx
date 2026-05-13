import { useEffect, useState } from 'react';
import {
  apiGetSummary, apiGetFoodList, apiCreateFood, apiUpdateFood,
  type FoodReport, type DailySummary, type CreateFoodReport,
} from '../api/client';
import styles from './Dashboard.module.css';

const today = () => new Date().toISOString().split('T')[0];
const fmt = (n: number) => Math.round(n).toLocaleString('ru');
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });

const EMPTY_FORM: CreateFoodReport = { name: '', gramms: 0, proteins: 0, fats: 0, carbs: 0 };

export default function Dashboard() {
  const [date, setDate] = useState(today());
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [list, setList] = useState<FoodReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: FoodReport | null }>({
    open: false, editing: null,
  });
  const [form, setForm] = useState<CreateFoodReport>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [s, l] = await Promise.all([apiGetSummary(date), apiGetFoodList(date)]);
      setSummary(s.data);
      setList(l.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [date]);

  const openAdd = () => { setForm(EMPTY_FORM); setFormError(''); setModal({ open: true, editing: null }); };
  const openEdit = (r: FoodReport) => {
    setForm({ name: r.name, gramms: r.gramms, proteins: r.proteins, fats: r.fats, carbs: r.carbs });
    setFormError('');
    setModal({ open: true, editing: r });
  };
  const closeModal = () => setModal({ open: false, editing: null });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setFormError('');
    try {
      if (modal.editing) await apiUpdateFood(modal.editing.id, form);
      else await apiCreateFood(form);
      closeModal();
      await load();
    } catch {
      setFormError('Ошибка при сохранении');
    } finally { setSaving(false); }
  };

  const GOAL_KCAL = 2500;
  const pct = summary ? Math.min((summary.total_calories / GOAL_KCAL) * 100, 100) : 0;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Дашборд</h1>
          <p className={styles.pageSub}>Трекинг питания</p>
        </div>
        <div className={styles.dateWrap}>
          <input
            type="date" className={styles.dateInput} value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      {/* Summary cards */}
      <div className={styles.cards}>
        <SummaryCard
          label="Калории" value={summary ? fmt(summary.total_calories) : '—'}
          unit="ккал" accent color="accent"
          sub={<ProgressBar pct={pct} goal={GOAL_KCAL} />}
        />
        <SummaryCard label="Белки" value={summary ? fmt(summary.total_proteins) : '—'} unit="г" color="blue" />
        <SummaryCard label="Жиры" value={summary ? fmt(summary.total_fats) : '—'} unit="г" color="yellow" />
        <SummaryCard label="Углеводы" value={summary ? fmt(summary.total_carbs) : '—'} unit="г" color="accent" />
      </div>

      {/* Macro bar */}
      {summary && <MacroBar summary={summary} />}

      {/* Food list */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Приёмы пищи</h2>
          <button className={styles.addBtn} onClick={openAdd}>+ Добавить</button>
        </div>

        {loading ? (
          <div className={styles.empty}>
            {[1,2,3].map(i => <div key={i} className={styles.skeleton} />)}
          </div>
        ) : list.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🍽</span>
            <p>Пока нет записей за этот день</p>
            <button className={styles.addBtnSm} onClick={openAdd}>Добавить первый приём</button>
          </div>
        ) : (
          <div className={styles.foodList}>
            {list.map((item) => (
              <FoodRow key={item.id} item={item} onEdit={() => openEdit(item)} />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal.open && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {modal.editing ? 'Редактировать' : 'Добавить продукт'}
              </h3>
              <button className={styles.closeBtn} onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSave} className={styles.modalForm}>
              <ModalField label="Название" type="text"
                value={form.name} onChange={(v) => setForm({ ...form, name: v })}
                placeholder="Гречка, куриная грудка…" required />
              <div className={styles.row4}>
                <ModalField label="Граммы" type="number"
                  value={form.gramms} onChange={(v) => setForm({ ...form, gramms: +v })}
                  placeholder="100" required min={1} />
                <ModalField label="Белки / 100г" type="number"
                  value={form.proteins} onChange={(v) => setForm({ ...form, proteins: +v })}
                  placeholder="20" required min={0} />
                <ModalField label="Жиры / 100г" type="number"
                  value={form.fats} onChange={(v) => setForm({ ...form, fats: +v })}
                  placeholder="5" required min={0} />
                <ModalField label="Угл. / 100г" type="number"
                  value={form.carbs} onChange={(v) => setForm({ ...form, carbs: +v })}
                  placeholder="30" required min={0} />
              </div>
              {form.proteins >= 0 && form.fats >= 0 && form.carbs >= 0 && form.gramms > 0 && (
                <div className={styles.preview}>
                  <span>≈ {fmt(calcKcal(form))} ккал</span>
                  <span>Б {fmt(form.proteins * form.gramms / 100)}г</span>
                  <span>Ж {fmt(form.fats * form.gramms / 100)}г</span>
                  <span>У {fmt(form.carbs * form.gramms / 100)}г</span>
                </div>
              )}
              {formError && <p className={styles.formError}>{formError}</p>}
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={closeModal}>Отмена</button>
                <button type="submit" className={styles.saveBtn} disabled={saving}>
                  {saving ? <span className={styles.spinnerDark} /> : (modal.editing ? 'Сохранить' : 'Добавить')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────

function SummaryCard({ label, value, unit, color, accent, sub }: {
  label: string; value: string; unit: string;
  color: 'accent' | 'blue' | 'yellow'; accent?: boolean; sub?: React.ReactNode;
}) {
  return (
    <div className={`${styles.card} ${styles[`card_${color}`]} ${accent ? styles.cardAccent : ''}`}>
      <p className={styles.cardLabel}>{label}</p>
      <p className={styles.cardValue}>
        {value} <span className={styles.cardUnit}>{unit}</span>
      </p>
      {sub}
    </div>
  );
}

function ProgressBar({ pct, goal }: { pct: number; goal: number}) {
  return (
    <div className={styles.progressWrap}>
      <div className={styles.progressTrack}>
        <div className={styles.progressFill} style={{ width: `${pct}%` }} />
      </div>
      <p className={styles.progressLabel}>{Math.round(pct)}% от цели {goal} ккал</p>
    </div>
  );
}

function MacroBar({ summary }: { summary: DailySummary }) {
  const total = summary.total_proteins + summary.total_fats + summary.total_carbs || 1;
  const pP = (summary.total_proteins / total) * 100;
  const pF = (summary.total_fats / total) * 100;
  const pC = (summary.total_carbs / total) * 100;

  return (
    <div className={styles.macroBar}>
      <p className={styles.macroTitle}>Макросы</p>
      <div className={styles.macroTrack}>
        <div className={styles.macroP} style={{ width: `${pP}%` }} title={`Белки ${Math.round(pP)}%`} />
        <div className={styles.macroF} style={{ width: `${pF}%` }} title={`Жиры ${Math.round(pF)}%`} />
        <div className={styles.macroC} style={{ width: `${pC}%` }} title={`Углеводы ${Math.round(pC)}%`} />
      </div>
      <div className={styles.macroLegend}>
        <span className={styles.legendP}>Белки {Math.round(pP)}%</span>
        <span className={styles.legendF}>Жиры {Math.round(pF)}%</span>
        <span className={styles.legendC}>Углеводы {Math.round(pC)}%</span>
      </div>
    </div>
  );
}

function FoodRow({ item, onEdit }: { item: FoodReport; onEdit: () => void }) {
  const kcal = Math.round(item.calories);
  const pct = Math.min((kcal / 800) * 100, 100);

  return (
    <div className={styles.foodRow} onClick={onEdit}>
      <div className={styles.foodLeft}>
        <p className={styles.foodName}>{item.name}</p>
        <p className={styles.foodMeta}>
          {item.gramms}г &nbsp;·&nbsp;
          Б {Math.round(item.proteins)}г &nbsp;
          Ж {Math.round(item.fats)}г &nbsp;
          У {Math.round(item.carbs)}г
        </p>
        <div className={styles.foodBar}>
          <div className={styles.foodBarFill} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className={styles.foodRight}>
        <p className={styles.foodKcal}>{kcal}</p>
        <p className={styles.foodKcalLabel}>ккал</p>
        <p className={styles.foodTime}>{fmtTime(item.report_time)}</p>
      </div>
    </div>
  );
}

function ModalField({ label, type, value, onChange, placeholder, required, min }: {
  label: string; type: string; value: string | number;
  onChange: (v: string) => void; placeholder?: string;
  required?: boolean; min?: number;
}) {
  return (
    <div className={styles.modalField}>
      <label className={styles.modalLabel}>{label}</label>
      <input
        className={styles.modalInput} type={type}
        value={value === 0 && type === 'number' ? '' : value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        min={min}
      />
    </div>
  );
}

function calcKcal(f: CreateFoodReport) {
  const p = f.proteins * f.gramms / 100;
  const fat = f.fats * f.gramms / 100;
  const c = f.carbs * f.gramms / 100;
  return 4 * (p + c) + 9 * fat;
}