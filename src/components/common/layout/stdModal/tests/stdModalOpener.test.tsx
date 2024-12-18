/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdModal from '@/components/common/layout/stdModal/StdModal';
import StdModalOpener from '@/components/common/layout/stdModal/StdModalOpener';
import { ModalContext } from '@/contexts/modalContext';
import ModalProvider from '@/providers/modalProvider';
import { noop } from '@/shared/utils/defaultUtils';
import { render, screen } from '@testing-library/react';
import { PropsWithChildren } from 'react';

const TEST_TEXT = 'My component wrapped in the modal';
const TEST_COMPONENT = <span role="article">{TEST_TEXT}</span>;
const TEST_MODAL_KEY = 'test-modal-key';
const TEST_OTHER_MODAL_KEY = 'other-test-modal-key';

vi.mock('@/providers/modalProvider.tsx', () => ({
  default: ({ children }: PropsWithChildren) => (
    <ModalContext.Provider
      value={{ currentModalKey: TEST_MODAL_KEY, closeModal: noop, openModal: noop, isOpen: () => true }}
    >
      {children}
    </ModalContext.Provider>
  ),
}));

describe('useModal', () => {
  it('render the expected component in the modal when the correct modal key is setted', () => {
    render(
      <ModalProvider>
        <StdModalOpener modalKey={TEST_MODAL_KEY}>
          <StdModal.Content>{TEST_COMPONENT}</StdModal.Content>
        </StdModalOpener>
      </ModalProvider>,
    );
    expect(screen.getByRole('article')).toBeInTheDocument();
  });
  it('do not render the component in a modal when the wrong modal key is setted', () => {
    render(
      <ModalProvider>
        <StdModalOpener modalKey={TEST_OTHER_MODAL_KEY}>
          <StdModal.Content>{TEST_COMPONENT}</StdModal.Content>
        </StdModalOpener>
      </ModalProvider>,
    );
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });
});
