import React, { useEffect, useRef, useContext, useState } from 'react';

import { Card} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import '../styles/utilities.css';
import CustomBadge from './CustomBadge';
import moment from 'moment';


export default function Thesis() {
  const [thesis, setThesis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    const { t, i18n } = useTranslation();
    useEffect(() => {
        async function fetchThesis() {
            try {
                const response = await fetch('/api/thesis');
                const data = await response.json();
                setThesis(data);
            } catch (error) {
                console.error('Error fetching thesis data:', error);
            }
        }
        fetchThesis();
    }, []);
    return (
        <Card className="mb-4">
            <Card.Header>
                <h5>{t('thesis.title')}</h5>
            </Card.Header>
            <Card.Body>
                {thesis ? (
                    <div>
                        <p>
                            <strong>{t('thesis.topic')}:</strong> {thesis.topic}
                        </p>
                        <p>
                            <strong>{t('thesis.applicationDate')}:</strong>{' '}
                            {moment(thesis.thesisApplicationDate).format('LL')}
                        </p>
                        <p>
                            <strong>{t('thesis.supervisor')}:</strong>{' '}
                            {thesis.supervisor
                                ? `${thesis.supervisor.firstName} ${thesis.supervisor.lastName}`
                                : t('thesis.noSupervisorAssigned')}
                        </p>
                        <p>
                            <strong>{t('thesis.coSupervisors')}:</strong>{' '}
                            {thesis.coSupervisors && thesis.coSupervisors.length > 0
                                ? thesis.coSupervisors
                                      .map(
                                          (co) => `${co.firstName} ${co.lastName}`
                                      )
                                      .join(', ')
                                : t('thesis.noCoSupervisorsAssigned')}
                        </p>
                        <p>
                            <strong>{t('thesis.company')}:</strong>{' '}
                            {thesis.company
                                ? thesis.company.name
                                : t('thesis.noCompanyAssigned')}
                        </p>
                    </div>
                ) : (
                    <p>{t('thesis.loading')}</p>
                )}
            </Card.Body>
        </Card>
    );      
}
