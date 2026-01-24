import React, { useContext, useEffect, useState } from 'react';

import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import PropTypes from 'prop-types';

import API from '../../API';
import { LoggedStudentContext, ThemeContext } from '../../App';
import CustomBreadcrumb from '../../components/CustomBreadcrumb';
import CustomHeader from '../../components/CustomHeader';
import LoadingModal from '../../components/LoadingModal';
import PillButtonGroup from '../../components/PillButtonGroup';
import Thesis from '../../components/Thesis';
import ThesisInfo from '../../components/ThesisInfo';
import ThesisProposals from '../../components/ThesisProposals';
import { getSystemTheme } from '../../utils/utils';

export default function Tesi({ initialActiveTab }) {
  const [thesisApplication, setThesisApplication] = useState(null);
  const [thesis, setThesis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { loggedStudent } = useContext(LoggedStudentContext);
  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isEligible, setIsEligible] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const { theme } = useContext(ThemeContext);
  const appliedTheme = theme === 'auto' ? getSystemTheme() : theme;

  useEffect(() => {
    // Update active tab based on URL path
    if (location.pathname.includes('/proposte_di_tesi')) {
      setActiveTab('proposals');
    } else if (location.pathname.includes('/richiesta_tesi')) {
      setActiveTab('application_form');
    } else {
      setActiveTab('thesis');
    }
  }, [location.pathname]);
  const tabs = [
    {
      key: 'thesis',
      label: thesis
        ? t('carriera.tesi.tabs.thesis')
        : thesisApplication
          ? t('carriera.tesi.tabs.thesis_application')
          : t('carriera.tesi.tabs.no_thesis'),
      value: 'thesis',
      onClick: () => {
        setActiveTab('thesis');
        navigate('/carriera/tesi');
      },
    },
    {
      key: 'proposals',
      label: t('carriera.tesi.tabs.proposals'),
      value: 'proposals',
      onClick: () => {
        setActiveTab('proposals');
        navigate('/carriera/tesi/proposte_di_tesi');
      },
    },
  ];

  useEffect(() => {
    setIsLoading(true);

    API.getLoggedStudentThesis()
      .then(data => {
        setThesis(data);
        setThesisApplication(null);
      })
      .catch(error => {
        console.error('Error fetching thesis:', error);
        setThesis(null);
        // Only if thesis fetch fails, fetch the application
        API.getLastStudentApplication()
          .then(appData => {
            setThesisApplication(appData);
          })
          .catch(appError => {
            console.error('Error fetching thesis application:', appError);
            setThesisApplication(null);
          });
      })
      .finally(() => {
        // Check eligibility regardless of thesis/application result
        API.checkStudentEligibility()
          .then(eligibleData => {
            setIsEligible(eligibleData.eligible);
          })
          .catch(eligibilityError => {
            console.error('Error checking student eligibility:', eligibilityError);
            setIsEligible(false);
          })
          .finally(() => {
            setIsLoading(false);
          });
      });
  }, [loggedStudent]);

  const renderContent = () => {
    if (isLoading) {
      return <LoadingModal show={isLoading} onHide={() => setIsLoading(false)} />;
    } else {
      switch (activeTab) {
        case 'thesis':
          if (thesis || thesisApplication) {
            return (
              <Thesis
                thesis={thesis}
                thesisApplication={thesisApplication}
                showModal={showModal}
                setShowModal={setShowModal}
                showRequestModal={showRequestModal}
                setShowRequestModal={setShowRequestModal}
              />
            );
          } else {
            return <ThesisInfo showModal={showRequestModal} setShowModal={setShowRequestModal} />;
          }
        case 'proposals':
          return <ThesisProposals showRequestModal={showRequestModal} setShowRequestModal={setShowRequestModal} />;
        default:
          return null;
      }
    }
  };

  return (
    <>
      <CustomBreadcrumb />
      <div className="proposal-container justify-content-between d-flex" style={{ paddingRight: '12px' }}>
        <CustomHeader title={t('carriera.tesi.title')} action={() => navigate('/carriera')} />
        {thesis &&
          activeTab === 'thesis' &&
          (thesis.thesisStatus === 'ongoing' || thesis.thesisStatus === 'conclusion_rejected') && (
            <div style={{ display: 'flex', gap: '16px', marginLeft: 'auto' }}>
              <Button
                variant="outline-danger"
                onClick={() => setShowModal(true)}
                style={{
                  height: '30px',
                  display: 'flex',
                  width: 'fit-content',
                  borderRadius: '6px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 10px',
                }}
              >
                <i className="fa-regular fa-trash-can me-1" /> {t('carriera.tesi.cancel_thesis')}
              </Button>
              <Button
                className={`btn-primary-${appliedTheme}`}
                onClick={() => setShowModal(true)}
                style={{
                  height: '30px',
                  display: 'flex',
                  width: 'fit-content',
                  borderRadius: '6px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 10px',
                }}
              >
                <i className="fa-regular fa-circle-check me-1" /> {t('carriera.tesi.conclusion_request_button')}
              </Button>
            </div>
          )}
        {thesisApplication && activeTab === 'thesis' && thesisApplication.status === 'pending' && (
          <Button
            variant="outline-danger"
            onClick={() => setShowModal(true)}
            style={{
              height: '30px',
              display: 'flex',
              width: 'fit-content',
              borderRadius: '6px',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 10px',
            }}
          >
            <i className="fa-regular fa-trash-can me-1" /> {t('carriera.tesi.cancel_application')}
          </Button>
        )}
        {isEligible && (
          <Button
            className={`btn-primary-${appliedTheme}`}
            onClick={() => {
              setShowRequestModal(true);
            }}
            style={{
              height: '30px',
              display: 'flex',
              width: 'fit-content',
              borderRadius: '6px',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 10px',
            }}
          >
            <i className="fa-regular fa-file-lines" /> {t('carriera.tesi.tabs.application_form')}
          </Button>
        )}
      </div>
      <div className="mb-3">
        <PillButtonGroup options={tabs} active={activeTab} />
      </div>
      {renderContent()}
    </>
  );
}

Tesi.propTypes = {
  initialActiveTab: PropTypes.string.isRequired,
};
