/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Delay, Duration, Rotate } from '@/shared/types';
import { iconClassBuilder } from './iconClassBuilder';

export type ExplicitIconProps = {
  isExplicit?: true;
  alt?: undefined;
};

export type NonExplicitIconProps = {
  isExplicit: false;
  alt: string;
};

export type RotationOptionsType = {
  delay: Delay;
  degree: Rotate;
  duration: Duration;
};

export type PlainIconProps = {
  name: string;
  url: string;
  color?: string;
  width?: number;
  height?: number;
  rotationOptions?: RotationOptionsType;
  rotate?: boolean;
  filledColor?: boolean;
};

export type IconProps = PlainIconProps & (ExplicitIconProps | NonExplicitIconProps);

const DEFAULT_SIZE = 20;

const Icon = ({
  name,
  url,
  isExplicit = true,
  alt,
  width = DEFAULT_SIZE,
  height = DEFAULT_SIZE,
  color,
  rotationOptions,
  rotate,
  filledColor,
}: IconProps) => {
  const iconClasses = iconClassBuilder(color, rotationOptions, rotate);

  if (filledColor && color) {
    return (
      <div
        aria-hidden={isExplicit}
        aria-label={alt}
        style={{
          maskImage: `url(${url})`,
          maskSize: '100%',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskImage: `url(${url})`,
          WebkitMaskSize: '100%',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          height,
          width,
        }}
        className={color.replace('text', 'bg')}
        role="img"
        title={name}
      />
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      role={!isExplicit ? 'img' : undefined}
      aria-hidden={isExplicit}
      aria-label={alt}
      className={iconClasses}
      width={width}
      height={height}
    >
      <title>{name}</title>
      <use href={url} fill="currentColor" width={width} height={height} />
    </svg>
  );
};

export default Icon;
