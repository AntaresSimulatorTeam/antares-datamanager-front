/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdModal from '@/components/common/layout/stdModal/StdModal';
import Hearder from '@/components/pegase/header/Hearder';
import { useState } from 'react';
import StudyTable from './components/StudyTable';

const HomePage = () => {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const handleButtonClick = () => {
    if (selectedRow) {
      setModalVisible(true); // Open the modal when a row is selected
    }
  };
  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return (
    <>
      <Hearder buttonLabel={selectedRow ? 'duplicate' : 'create'} onButtonClick={handleButtonClick} />
      <StudyTable setSelectedRow={setSelectedRow} selectedRow={selectedRow || 0} />
      {isModalVisible && (
        <StdModal onClose={() => setModalVisible(false)} size="medium">
          <StdModal.Title onClose={handleCloseModal}>
            <h2>Duplicate Study</h2>
          </StdModal.Title>
          <StdModal.Content>
            <p>You are about to duplicate the selected item. Are you sure?</p>
          </StdModal.Content>
          <StdModal.Footer>
            <button onClick={() => setModalVisible(false)}>Cancel</button>
            <button onClick={() => {}}>Confirm</button>
          </StdModal.Footer>
        </StdModal>
      )}
    </>
  );
};

export default HomePage;
