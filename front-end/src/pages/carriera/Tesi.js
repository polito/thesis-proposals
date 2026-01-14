import React, { useContext, useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

import API from '../../API';
import { BodyDataLoadingContext, LoggedStudentContext } from '../../App';
import CustomBadge from '../../components/CustomBadge';
import CustomBreadcrumb from '../../components/CustomBreadcrumb';
import Thesis from '../../components/Thesis';


export default function Tesi() {
  const { setBodyDataLoading } = useContext(BodyDataLoadingContext);
  const { loggedStudent } = useContext(LoggedStudentContext);
  const [thesisApplication, setThesisApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (!loggedStudent?.id) {
      return;
    }

    setBodyDataLoading(true);
    setIsLoading(true);

    API.getStudentActiveApplication(loggedStudent.id)
      .then(fetchedThesisApplication => {
        console.log('Fetched Thesis Application:', fetchedThesisApplication);
        setThesisApplication(fetchedThesisApplication);
      })
      .catch(error => console.error('Error fetching active student application:', error))
      .finally(() => {
        setBodyDataLoading(false);
        setIsLoading(false);
      });
  }, [loggedStudent, setBodyDataLoading]);

    const renderContent = () => {
      if (isLoading) {
        return <></>;
      } else if (thesisApplication) {
        return <Thesis thesisApplication={thesisApplication}  />;
      } else {
        return <CustomBadge variant="error" content={t('carriera.tesi.error')} />;
      }
    };

  return (
    <>
      <CustomBreadcrumb />
      {renderContent()}
    </>
  );
}
