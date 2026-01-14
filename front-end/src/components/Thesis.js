import React, { useEffect, useRef, useContext, useState } from 'react';

import { Card, Col, Row, Button, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import '../styles/utilities.css';
import CustomBadge from './CustomBadge';
import moment from 'moment';


import PropTypes from 'prop-types';



export default function Thesis(props) {
  const { thesisApplication } = props;
  const teachers = [thesisApplication.supervisor, ...thesisApplication.internalCoSupervisors];
  const { t } = useTranslation();
  return thesisApplication && (
    <div className="proposals-container">
      <Card className="mb-3 roundCard py-2">
        {thesisApplication.topic && (
          <Card.Header className="border-0">
            <Row className='d-flex justify-content-between'>
              <Col xs={10} sm={10} md={11} lg={11} xl={11} style={{ marginBottom: '10px' }}>
                <h3 className="thesis-topic"><i className="fa-solid fa-graduation-cap fa-sm pe-2" />{t('carriera.tesi.your_thesis')}{thesisApplication.topic}</h3>
              </Col>
            </Row>
          </Card.Header>
        )}
        <Card.Body className="pt-2 pb-0">
          {thesisApplication.description && (<MyBlock icon="info-circle" title="carriera.proposte_di_tesi.description" ignoreMoreLines>
            {thesisApplication.description || '-'}
          </MyBlock>)}
          {teachers && teachers.length > 0 && (
            <MyBlock icon="user-plus" title="carriera.tesi.supervisors" ignoreMoreLines>
              <CustomBadge
                variant="teacher"
                content={teachers.map(cs => `${cs.lastName} ${cs.firstName}`)}
              />
            </MyBlock>
          )}
          <MyBlock icon="calendar-clock" title="carriera.tesi.submission_date">
            {moment(thesisApplication.submissionDate).format('DD/MM/YYYY - HH:mm')}
          </MyBlock>
          {thesisApplication.requestConclusion &&
            (<MyBlock icon="calendar-circle-exclamation" title="carriera.tesi.date_conclusion_request">
              {moment(thesisApplication.requestConclusion).format('DD/MM/YYYY - HH:mm')}
            </MyBlock>)}
          {thesisApplication.conclusionConfirmation &&
            (<MyBlock icon="calendar-check" title="carriera.tesi.date_conclusion_confirmation">
              {moment(thesisApplication.requestConclusion).format('DD/MM/YYYY - HH:mm')}
            </MyBlock>)}
          <MyBlock icon="diagram-project" title="carriera.tesi.status" ignoreMoreLines>
            <CustomBadge
              variant="app_status"
              content={thesisApplication.status}
            />
          </MyBlock>
          <MyBlock icon="paperclip" title="carriera.tesi.utilities.title" ignoreMoreLines>
            <div className="d-flex align-items-center">
              <i className="fa fa-copyright fa-fw me-2" />
              <a
                href={`https://didattica.polito.it/tesi/DirittoAutoreTesi.pdf`}
                className="info-detail d-flex align-items-center"
              >
                {t('carriera.tesi.utilities.copyright')}
              </a>
            </div>

            <div className="d-flex align-items-center">
              <i className="fa fa-youtube fa-fw me-2" />
              <a
                href={`${t('carriera.tesi.utilities.plagiarism_link')}`}
                className="info-detail d-flex align-items-center"
              >
                {t('carriera.tesi.utilities.plagiarism')}
              </a>
            </div>
          </MyBlock>
          {thesisApplication.company && (<MyBlock icon="file-lines" title="carriera.tesi.utilities.template" ignoreMoreLines>
            <a
              href={`https://didattica.polito.it/pls/portal30/stagejob.tesi_in_azi.pdf_it`}
              className="info-detail d-flex align-items-center"
            >
              <i className="fi fi-it fa-fw me-2" />{t('carriera.tesi.utilities.italian_version')}
            </a>
            <a
              href={`https://didattica.polito.it/pls/portal30/stagejob.tesi_in_azi.pdf_en`}
              className="info-detail d-flex align-items-center"
            >
              <i className="fi fi-gb fa-fw me-2" />{t('carriera.tesi.utilities.english_version')}
            </a>
          </MyBlock>)}
        </Card.Body>
      </Card>
    </div>
  );
}

function MyBlock({ icon, title, children, ignoreMoreLines }) {
  const { t } = useTranslation();
  const [moreLines, setMoreLines] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (ignoreMoreLines) {
      return;
    }
    const element = contentRef.current;
    if (element) {
      const computedStyle = window.getComputedStyle(element);
      const lineHeight = parseFloat(computedStyle.lineHeight);
      const lines = element.offsetHeight / lineHeight;

      setMoreLines(lines > 1);
    }
  }, [children, ignoreMoreLines]);

  return (
    <div className={moreLines ? 'text-container' : 'info-container mb-3'}>
      <div className={`title-container ${moreLines ? 'pb-1' : ''}`}>
        {icon && <i className={`fa-regular fa-${icon} fa-fw`} />}
        {t(title)}:
      </div>
      <div ref={contentRef} className={`info-detail ${moreLines ? 'aligned mb-3' : ''}`}>
        {children}
      </div>
    </div>
  );
}



Thesis.propTypes = {
  thesisApplication: PropTypes.shape({
    id: PropTypes.number.isRequired,
    topic: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    description: PropTypes.string,
    submissionDate: PropTypes.string,
    isEmbargo: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf([null])]),
    requestConclusion: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf([null])]),
    conclusionConfirmation: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf([null])]),
    student: PropTypes.shape({
      id: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
      profilePictureUrl: PropTypes.string,
      degreeId: PropTypes.string,
    }).isRequired,
    company: PropTypes.object,
    supervisor: PropTypes.oneOfType([PropTypes.object, PropTypes.oneOf([null])]),
    coSupervisors: PropTypes.array,
  }).isRequired,
};

MyBlock.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  ignoreMoreLines: PropTypes.bool,
};