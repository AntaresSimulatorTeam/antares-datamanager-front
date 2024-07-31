/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import StdSearchInput from '../StdSearchInput';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import { noop } from '@/shared/utils/common/defaultUtils';

const TEST_ICON = StdIconId.Search;

const CLOSE_BUTTON = StdIconId.Close;
const INPUT_ID = 'search-me-better-than-google';
const COMMON_PLACEHOLDER = 'Veuillez effectuer votre recherche';
const COMMON_LABEL = 'Alpha';
const COMMON_DEFAULT_VALUE = 'Where are the Metrix';
const COMMON_ROLE = 'searchbox';

describe('Search Input', () => {
  it('renders SearchInput Component', () => {
    render(<StdSearchInput label="" placeHolder="" onSearch={noop} />);
    expect(screen.getByTitle(TEST_ICON)).toBeInTheDocument();
  });

  it('It shows label when sent', () => {
    render(<StdSearchInput label={COMMON_LABEL} placeHolder={COMMON_PLACEHOLDER} onSearch={noop} />);
    expect(screen.getByLabelText(COMMON_LABEL)).toBeInTheDocument();
  });

  it('It shows The Label', () => {
    render(<StdSearchInput placeHolder={COMMON_PLACEHOLDER} label={COMMON_LABEL} onSearch={noop} />);
    expect(screen.getByLabelText(COMMON_LABEL)).toBeInTheDocument();
  });

  it('It is focusable when not disabled', () => {
    render(<StdSearchInput placeHolder={COMMON_PLACEHOLDER} label={COMMON_LABEL} id={INPUT_ID} onSearch={noop} />);
    const inputText = screen.getByLabelText(COMMON_LABEL);
    inputText.focus();
    expect(screen.getByRole(COMMON_ROLE)?.matches(':focus')).toBeTruthy();
  });
  it('It is not focusable when Disabled', () => {
    render(
      <StdSearchInput placeHolder={COMMON_PLACEHOLDER} label={COMMON_LABEL} id={INPUT_ID} disabled onSearch={noop} />,
    );
    const inputText = screen.getByLabelText(COMMON_LABEL);
    inputText.focus();
    expect(screen.getByRole(COMMON_ROLE)?.matches(':focus')).toBeFalsy();
  });
  it('It does not show clear button when there is no text', () => {
    render(<StdSearchInput placeHolder={COMMON_PLACEHOLDER} label={COMMON_LABEL} onSearch={noop} />);

    expect(screen.getByTitle(CLOSE_BUTTON)).not.toBeVisible();
  });
  it('It shows clear button when text is enterred', () => {
    render(
      <StdSearchInput
        placeHolder={COMMON_PLACEHOLDER}
        label={COMMON_LABEL}
        defaultValue={COMMON_DEFAULT_VALUE}
        onSearch={noop}
      />,
    );
    expect(screen.getByTitle(CLOSE_BUTTON)).toBeInTheDocument();
  });
  it('It clears input when clear button clicked', () => {
    render(
      <StdSearchInput
        placeHolder={COMMON_PLACEHOLDER}
        label={COMMON_LABEL}
        defaultValue={COMMON_DEFAULT_VALUE}
        onSearch={noop}
      />,
    );
    const clearBtn = screen.getByTitle(CLOSE_BUTTON);
    fireEvent(
      clearBtn,
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(screen.getByDisplayValue('')).toBeInTheDocument();
  });
});
