import React from 'react';

import { Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import moment from 'moment';
import PropTypes from 'prop-types';

import '../styles/custom-progress-tracker.css';

export default function Timeline({ activeStep, statusHistory }) {
  const { t } = useTranslation();
  const [expandedNote, setExpandedNote] = React.useState(null);

  const getHistoryForStatus = targetStatus => {
    if (!statusHistory || statusHistory.length === 0) return null;
    return statusHistory.find(h => h.newStatus === targetStatus);
  };

  const firstStep = {
    key: 'pending',
    label: t('carriera.tesi.progress_application.pending'),
    description: t('carriera.tesi.progress_application.pending_description'),
  };

  // Step 2: Outcome della application (dipende da applicationStatus)
  const getSecondStep = () => {
    switch (activeStep) {
      case 'approved':
      case 'step_1':
      case 'step_2':
      case 'step_3':
      case 'step_4':
      case 'step_5':
        return {
          key: 'approved',
          label: t('carriera.tesi.progress_application.approved'),
          description: t('carriera.tesi.progress_application.approved_description'),
          date: activeStep !== 'approved',
        };
      case 'rejected':
        return {
          key: 'rejected',
          label: t('carriera.tesi.progress_application.rejected'),
          description: t('carriera.tesi.progress_application.rejected_description'),
        };
      case 'canceled':
        return {
          key: 'canceled',
          label: t('carriera.tesi.progress_application.canceled'),
          description: t('carriera.tesi.progress_application.canceled_description'),
        };
      default:
        return {
          key: 'outcome',
          label: t('carriera.tesi.progress_application.outcome'),
          description: t('carriera.tesi.progress_application.outcome_description'),
        };
    }
  };

  // Step 3+: Thesis workflow (dipende da activeStatus)
  const getThesisSteps = () => {
    return [
      {
        key: 'step_1',
        label: t('carriera.tesi.next_steps.step_1_title'),
        description: t('carriera.tesi.next_steps.step_1'),
      },
      {
        key: 'step_2',
        label: t('carriera.tesi.next_steps.step_2_title'),
        description: t('carriera.tesi.next_steps.step_2'),
      },
      {
        key: 'step_3',
        label: t('carriera.tesi.next_steps.step_3_title'),
        description: t('carriera.tesi.next_steps.step_3'),
      },
      {
        key: 'step_4',
        label: t('carriera.tesi.next_steps.step_4_title'),
        description: t('carriera.tesi.next_steps.step_4'),
      },
      {
        key: 'step_5',
        label: t('carriera.tesi.next_steps.step_5_title'),
        description: t('carriera.tesi.next_steps.step_5'),
      },
    ];
  };

  const secondStep = getSecondStep();
  const thesisSteps = getThesisSteps();
  const steps = [firstStep, secondStep, ...thesisSteps];

  const renderStep = (step, activeStep) => {
    const { key, label, description } = step;

    const isActive = activeStep === key;

    let circleClass;
    let titleClass;
    let historyEntry = null;

    switch (key) {
      case 'pending':
      case 'approved':
      case 'rejected':
      case 'canceled':
        historyEntry = statusHistory ? getHistoryForStatus(key) : null;
        circleClass = isActive ? key : 'inactive';
        titleClass = isActive ? `active active-${key}` : '';
        break;
      default:
        circleClass = isActive ? 'pending' : 'inactive';
        titleClass = isActive ? `active active-${key}` : '';
        historyEntry = null;
    }

    return (
      <div key={key} className="progress-step">
        <div className="progress-step-marker">
          <div className={`progress-step-circle ${circleClass}`}>
            {isActive && key === 'approved' && <i className="fa-solid fa-check" />}
            {isActive && key === 'rejected' && <i className="fa-solid fa-xmark" />}
            {isActive && key === 'canceled' && <i className="fa-solid fa-ban" />}
          </div>
        </div>
        <div className="progress-step-content">
          <h6 className={`progress-step-title ${titleClass}`}>{label}</h6>
          <p className="progress-step-description">{description}</p>
          {historyEntry && (
            <>
              <div className="progress-step-date">
                <i className="fa-solid fa-clock me-1" />
                {moment(historyEntry.changeDate).format('DD/MM/YYYY - HH:mm')}
              </div>
              {historyEntry.note && (
                <>
                  <div
                    className="progress-step-note-toggle"
                    role="button"
                    tabIndex={0}
                    onClick={() => setExpandedNote(expandedNote === key ? null : key)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setExpandedNote(expandedNote === key ? null : key);
                      }
                    }}
                  >
                    <i className="fa-solid fa-comment me-2" />
                    {key !== 'canceled'
                      ? expandedNote === key
                        ? t('carriera.tesi.progress_application.hide_supervisor_note')
                        : t('carriera.tesi.progress_application.show_supervisor_note')
                      : expandedNote === key
                        ? t('carriera.tesi.progress_application.hide_note')
                        : t('carriera.tesi.progress_application.show_note')}
                    <i className={`fa-solid fa-chevron-${expandedNote === key ? 'up' : 'down'} ms-2`} />
                  </div>
                  {expandedNote === key && (
                    <div className="progress-step-note">
                      <p style={{ whiteSpace: 'pre-line' }}>{historyEntry.note}</p>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="mb-3 roundCard py-2">
      <Card.Header className="border-0">
        <h3 className="thesis-topic">
          <i className="fa-solid fa-timeline fa-sm pe-2" />
          {t('carriera.tesi.timeline')}
        </h3>
      </Card.Header>
      <Card.Body>
        <div className="progress-tracker-container">{steps.map(step => renderStep(step, activeStep))}</div>
      </Card.Body>
    </Card>
  );
}

Timeline.propTypes = {
  activeStep: PropTypes.oneOf([
    'pending',
    'approved',
    'rejected',
    'canceled',
    'step_1',
    'step_2',
    'step_3',
    'step_4',
    'step_5',
  ]).isRequired,
  statusHistory: PropTypes.arrayOf(
    PropTypes.shape({
      oldStatus: PropTypes.string,
      newStatus: PropTypes.string.isRequired,
      note: PropTypes.string,
      changeDate: PropTypes.string.isRequired,
    }),
  ),
  startDate: PropTypes.string,
};
