import { useState, useEffect } from 'react';
import './Dashboard.css';
import { CalendarScreen } from '../components/CalendarScreen/CalendarScreen';
import { DashboardApiService, type Professional } from '../api/DashboardApi';
import { RoleProfessions } from '../utils/dashboardUtils';

interface Medico {
  nome: string;
  status: string;
  sala?: string;
}

interface MedicoComAla extends Medico {
  ala: string;
}

const Dashboard = () => {
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    cirurgias: [],
    alertas: [
      { tipo: 'warning', titulo: 'Cirurgia Atrasada', descricao: 'Atraso de 10 min - Sala C01 - Dr. Silva' },
      { tipo: 'info', titulo: 'Sala em Higienização', descricao: 'Sala O03 - Finaliza em 15 min' },
      { tipo: 'success', titulo: 'Sala Disponível', descricao: 'Sala N01 acabou de ficar disponível' },
      { tipo: 'warning', titulo: 'Equipamento em Manutenção', descricao: 'Monitor cardíaco - Sala C02' }
    ],
    profissionais: [] as Professional[]
  });


  const [metricas, setMetricas] = useState({
    taxaOcupacao: 87,
    tempoMedioEspera: 12,
    equipamentosBons: 89,
    eficienciaOperacional: 94
  });

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      setCurrentDateTime(now.toLocaleDateString('pt-BR', options));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadProfissionais = async () => {
      const profissionais = await DashboardApiService.getProfessionals();
      console.log(profissionais);
      
      setDashboardData(prev => ({
        ...prev,
        profissionais
      }));
    };

    loadProfissionais();
  }, []);

  const atualizarMetricas = () => {
    setMetricas({
      taxaOcupacao: Math.floor(Math.random() * 20) + 80,
      tempoMedioEspera: Math.floor(Math.random() * 10) + 8,
      equipamentosBons: Math.floor(Math.random() * 15) + 85,
      eficienciaOperacional: Math.floor(Math.random() * 10) + 90
    });
  };

  const getMedicosDisponiveis = () => {
    const disponiveis = dashboardData.profissionais.filter(p => p.status === 'disponivel');
    return { 
      total: disponiveis.length, 
      disponiveis: disponiveis.map(p => ({ nome: p.name, status: p.status, sala: p.sala, ala: p.role })) 
    };
  };

  const { total: totalDisponiveis, disponiveis: medicosDisponiveis } = getMedicosDisponiveis();

  const alaNames: Record<string, string> = {
    cardiologia: 'Cardiologia',
    neurologia: 'Neurologia',
    ortopedia: 'Ortopedia',
    emergencia: 'Emergência'
  };

  return (
    <div className="dashboard">
      {showCalendar ? (
        <></>
      ) : (
        <>
          <header className="bg-gray-50 p-4 flex justify-between items-center">
            <div className="flex items-center gap-12">
              <div className="nav-brand" onClick={() => setShowCalendar(false)} style={{ cursor: 'pointer' }}>
                <i className="fas fa-hospital"></i>
                <span>CoreMed</span>
              </div>

            </div>

            <ul className="nav-menu">
              <li><a href="#" className={!showCalendar ? 'active' : ''} onClick={() => setShowCalendar(false)}><i className="fas fa-home"></i> Dashboard</a></li>
              <li><a href="#" className={showCalendar ? 'active' : ''} onClick={() => setShowCalendar(true)}><i className="fas fa-calendar-plus"></i> Agendar</a></li>
            </ul>
          </header>
        </>
      )}

      <main className="bg-white">
        {showCalendar ? (
          <CalendarScreen setShowCalendar={setShowCalendar} showCalendar={showCalendar} />
        ) : (
          <div className="p-4 space-y-4  mx-auto w-[90vw]">
            <div className="dashboard-header">
              <h1><i className="fas fa-tachometer-alt"></i> Dashboard Executivo</h1>
              <div className="date-time">
                <span>{currentDateTime}</span>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-icon">
                  <i className="fas fa-calendar-check"></i>
                </div>
                <div className="stat-info">
                  <h3>0</h3>
                  <p>Cirurgias Hoje</p>
                </div>
              </div>

              <div className="stat-card success">
                <div className="stat-icon">
                  <i className="fas fa-user-md"></i>
                </div>
                <div className="stat-info">
                  <h3>{totalDisponiveis}</h3>
                  <p>Médicos Disponíveis</p>
                </div>
              </div>

              <div className="stat-card warning">
                <div className="stat-icon">
                  <i className="fas fa-door-open"></i>
                </div>
                <div className="stat-info">
                  <h3>8</h3>
                  <p>Salas Livres</p>
                </div>
              </div>

              <div className="stat-card info">
                <div className="stat-icon">
                  <i className="fas fa-tools"></i>
                </div>
                <div className="stat-info">
                  <h3>95%</h3>
                  <p>Equipamentos OK</p>
                </div>
              </div>
            </div>

            <div className="dashboard-grid">
              {/* Timeline */}
              <div className="card">
                <div className="card-header">
                  <h2><i className="fas fa-clock"></i> Próximas Cirurgias</h2>
                  <div className="header-actions">
                    <button className="btn-small" onClick={() => atualizarMetricas()}>
                      <i className="fas fa-sync"></i> Atualizar
                    </button>
                    <button className="btn-small" onClick={() => setShowCalendar(true)}>
                      <i className="fas fa-plus"></i> Nova
                    </button>
                  </div>
                </div>
                <div className="timeline">
                  <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', color: '#e0e0e0', marginBottom: '1rem' }}>
                      <i className="fas fa-calendar-day"></i>
                    </div>
                    <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                      Nenhuma cirurgia agendada para hoje
                    </p>
                    <p style={{ color: '#999', fontSize: '0.9rem' }}>
                      Clique em "Nova" para agendar uma cirurgia
                    </p>
                  </div>
                </div>
              </div>

              {/* Alertas */}
              <div className="card">
                <div className="card-header">
                  <h2><i className="fas fa-bell"></i> Alertas Inteligentes</h2>
                  <span className="alert-count">{dashboardData.alertas.length}</span>
                </div>
                <div className="alerts-list">
                  {dashboardData.alertas.map((alerta, index) => (
                    <div key={index} className={`alert alert-${alerta.tipo}`}>
                      <i className={`fas fa-${alerta.tipo === 'warning' ? 'exclamation-triangle' :
                        alerta.tipo === 'info' ? 'info-circle' : 'check-circle'}`}></i>
                      <div>
                        <strong>{alerta.titulo}</strong>
                        <p>{alerta.descricao}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alas do Hospital */}
              <div className="card">
                <div className="card-header">
                  <h2><i className="fas fa-building"></i> Alas do Hospital</h2>
                </div>
                <div className="alas-grid">
                  <div className="ala-card cardio">
                    <div className="ala-header">
                      <i className="fas fa-heart"></i>
                      <h3>Ala Cardiologia</h3>
                    </div>
                    <div className="ala-salas">
                      <div className="sala-mini occupied">C01</div>
                      <div className="sala-mini available">C02</div>
                      <div className="sala-mini cleaning">C03</div>
                    </div>
                    <p>2/3 Salas Ocupadas</p>
                  </div>
                  <div className="ala-card neuro">
                    <div className="ala-header">
                      <i className="fas fa-brain"></i>
                      <h3>Ala Neurologia</h3>
                    </div>
                    <div className="ala-salas">
                      <div className="sala-mini available">N01</div>
                      <div className="sala-mini occupied">N02</div>
                      <div className="sala-mini available">N03</div>
                    </div>
                    <p>1/3 Salas Ocupadas</p>
                  </div>
                  <div className="ala-card ortho">
                    <div className="ala-header">
                      <i className="fas fa-bone"></i>
                      <h3>Ala Ortopedia</h3>
                    </div>
                    <div className="ala-salas">
                      <div className="sala-mini occupied">O01</div>
                      <div className="sala-mini occupied">O02</div>
                      <div className="sala-mini maintenance">O03</div>
                    </div>
                    <p>2/3 Salas Ocupadas</p>
                  </div>
                  <div className="ala-card emergency">
                    <div className="ala-header">
                      <i className="fas fa-ambulance"></i>
                      <h3>Emergência</h3>
                    </div>
                    <div className="ala-salas">
                      <div className="sala-mini available">E01</div>
                      <div className="sala-mini available">E02</div>
                      <div className="sala-mini available">E03</div>
                    </div>
                    <p>3/3 Salas Livres</p>
                  </div>
                </div>
              </div>

              {/* Profissionais */}
              <div className="card medicos-alas-card">
                <div className="card-header">
                  <h2><i className="fas fa-users"></i> Profissionais</h2>
                </div>
                <div className="medicos-alas">
                  {dashboardData.profissionais.map((item) => (
                    <div key={item.id} className="ala-medicos">
                      <h4>{item.role.map(role => RoleProfessions[role]).join(', ')}</h4>
                      <div className="medicos-list">
                        {dashboardData.profissionais.map((profissional: Professional, index: number) => {
                          const statusIcon: Record<string, string> = {
                            'disponivel': 'fas fa-circle text-success',
                            'cirurgia': 'fas fa-circle text-danger',
                            'consulta': 'fas fa-circle text-warning'
                          };

                          return (
                            <div key={index} className="medico-item">
                              <i className={statusIcon[profissional.status]}></i>
                              <span>{profissional.name}</span>
                              {profissional.sala && <small>({profissional.sala})</small>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Métricas */}
              <div className="card metricas-card">
                <div className="card-header">
                  <h2><i className="fas fa-tachometer-alt"></i> Métricas em Tempo Real</h2>
                  <button className="btn-small" onClick={atualizarMetricas}>
                    <i className="fas fa-sync"></i>
                  </button>
                </div>
                <div className="metrics-grid">
                  <div className="metric-item">
                    <div className="metric-value">{metricas.taxaOcupacao}%</div>
                    <div className="metric-label">Taxa de Ocupação</div>
                    <div className="metric-trend positive">+5%</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-value">{metricas.tempoMedioEspera}min</div>
                    <div className="metric-label">Tempo Médio Espera</div>
                    <div className="metric-trend negative">-3min</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-value">{metricas.equipamentosBons}%</div>
                    <div className="metric-label">Equipamentos Bons</div>
                    <div className="metric-trend positive">+3%</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-value">{metricas.eficienciaOperacional}%</div>
                    <div className="metric-label">Eficiência Operacional</div>
                    <div className="metric-trend positive">+2%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Botão Flutuante */}
      {!showCalendar && (
        <div className="fab-container">
          <button className="fab" title="Agendar Nova Cirurgia" onClick={() => setShowCalendar(true)}>
            <i className="fas fa-plus"></i>
          </button>
          <div className="fab-tooltip">Agendar Cirurgia</div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;