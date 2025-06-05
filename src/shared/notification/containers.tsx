/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ToastProps } from 'node_modules/react-toastify/dist/types';
import { ReactNode } from 'react';
import { Flip, ToastContainer, ToastContainerProps, useToast, useToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './containers.css';
import { RdsIcon, RdsIconId } from 'rte-design-system-react';

type NotificationContainerProps = ToastContainerProps;

export const NotificationContainer = (props: NotificationContainerProps) => (
  <ToastContainer {...props} closeButton={false} icon={false} />
);

export const ToastContainerId = 'toast';

export const PegaseToastContainer = () => (
  <NotificationContainer
    containerId={ToastContainerId}
    position="top-center"
    limit={1}
    autoClose={5000}
    pauseOnFocusLoss={false}
  />
);

export const AlertContainerId = 'alert';
export const PegaseAlertContainer = () => (
  <NotificationContainer
    containerId={AlertContainerId}
    position="bottom-right"
    limit={50}
    autoClose={false}
    stacked
    className="!bottom-8 text-gray-900"
    toastClassName="!bg-gray-w !bg-white !font-nunito font-normal text-black"
    bodyClassName="!bg-gray-w !bg-white !font-nunito font-normal text-black"
    toastStyle={{ backgroundColor: 'white !important' }}
    style={{ width: '500px', color: 'black' }}
    hideProgressBar
    closeOnClick={true}
    icon={() => <RdsIcon name={RdsIconId.Close} color="secondary" />}
  />
);

export const BannerContainerId = 'banner';
const BannerToast = (props: ToastProps) => {
  const { preventExitTransition, toastRef, playToast } = useToast(props);
  const { transition: Transition, position, deleteToast, isIn, children } = props;
  return (
    <Transition
      playToast={playToast}
      isIn={isIn}
      done={deleteToast}
      position={position}
      preventExitTransition={preventExitTransition}
      nodeRef={toastRef}
    >
      <div ref={toastRef}>{children as ReactNode}</div>
    </Transition>
  );
};

export const PegaseBannerContainer = () => {
  const { getToastToRender, isToastActive } = useToastContainer({
    containerId: BannerContainerId,
    position: 'top-center',
    limit: 1,
    transition: Flip,
  });
  return (
    <div className="sticky top-0 z-50">
      {getToastToRender((_position, toastList) =>
        toastList.map(({ content, props: toastProps }) => (
          <BannerToast
            {...toastProps}
            isIn={isToastActive(toastProps.toastId, BannerContainerId)}
            key={toastProps.toastId}
          >
            {content}
          </BannerToast>
        )),
      )}
    </div>
  );
};
