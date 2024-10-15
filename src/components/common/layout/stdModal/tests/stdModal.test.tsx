/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { render, screen } from '@testing-library/react';

import StdButton from '@/components/common/base/stdButton/StdButton';
import StdModal from '../StdModal';

const onClose = vitest.fn();
const TEST_ID = 'some-id';
const TEST_TITLE = <div>Modal Title</div>;
const TEST_CHILDREN = <div role="article">Main Content</div>;
const TEST_LATERAL_CHILDREN = <div role="region">Lateral Content</div>;
const TEST_BUTTONS = [<StdButton label="button" key="1" />, <StdButton label="button" key="2" />];

describe('StdModal', () => {
  it('renders the StdModal with the proper id when specified', () => {
    render(
      <StdModal id={TEST_ID}>
        <StdModal.Content>{TEST_CHILDREN}</StdModal.Content>
      </StdModal>,
    );
    expect(document.querySelector(`#${TEST_ID}`)).toBeInTheDocument();
  });

  it('render the StdModal without lateral content', () => {
    render(
      <StdModal>
        <StdModal.Title onClose={onClose}>{TEST_TITLE}</StdModal.Title>
        <StdModal.Content>{TEST_CHILDREN}</StdModal.Content>
        <StdModal.Footer>{TEST_BUTTONS}</StdModal.Footer>
      </StdModal>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('article')).toBeInTheDocument();
    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  it('render the StdModal with lateral content ', () => {
    render(
      <StdModal>
        <StdModal.Title onClose={onClose}>{TEST_TITLE}</StdModal.Title>
        <StdModal.Content>{TEST_CHILDREN}</StdModal.Content>
        <StdModal.LateralContent>{TEST_LATERAL_CHILDREN}</StdModal.LateralContent>
        <StdModal.Footer>{TEST_BUTTONS}</StdModal.Footer>
      </StdModal>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('article')).toBeInTheDocument();
    expect(screen.getByRole('region')).toBeInTheDocument();
    expect(screen.getByRole('group')).toBeInTheDocument();
  });
});
