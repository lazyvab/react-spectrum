import {calculatePosition} from './calculatePosition';
import {HTMLAttributes, RefObject, useEffect, useState} from 'react';

type Placement = 'bottom' | 'bottom left' | 'bottom right' | 'bottom start' | 'bottom end' |
    'top' | 'top left' | 'top right' | 'top start' | 'top end' |
    'left' | 'left top' | 'left bottom' | 'start' | 'start top' | 'start bottom' |
    'right' | 'right top' | 'right bottom' | 'end' | 'end top' | 'end bottom';

export interface PositionProps {
  placement?: Placement,
  containerPadding?: number,
  offset?: number,
  crossOffset?: number,
  shouldFlip?: boolean,
  boundaryElement?: Element,
  isOpen?: boolean
}

interface AriaPositionProps extends PositionProps {
  containerRef: RefObject<Element>,
  triggerRef: RefObject<Element>,
  overlayRef: RefObject<Element>,
  shouldUpdatePosition?: boolean
}

interface PositionAria {
  overlayProps: HTMLAttributes<Element>,
  arrowProps: HTMLAttributes<Element>,
  placement: Placement
}

interface PositionState {
  positionLeft?: number,
  positionTop?: number,
  arrowOffsetLeft?: number,
  arrowOffsetTop?: number,
  maxHeight?: number,
  placement: Placement
}

export function useOverlayPosition(props: AriaPositionProps): PositionAria {
  let {
    containerRef,
    triggerRef,
    overlayRef,
    placement = 'bottom' as Placement,
    containerPadding = 0,
    shouldFlip = true,
    boundaryElement = document.body,
    offset = 0,
    crossOffset = 0,
    shouldUpdatePosition = true,
    isOpen = true
  } = props;
  let [position, setPosition] = useState<PositionState>({
    positionLeft: 0,
    positionTop: 0,
    arrowOffsetLeft: undefined,
    arrowOffsetTop: undefined,
    maxHeight: undefined,
    placement
  });

  let deps = [
    shouldUpdatePosition,
    placement,
    overlayRef.current,
    triggerRef.current,
    containerRef.current,
    containerPadding,
    shouldFlip,
    boundaryElement,
    offset,
    crossOffset,
    isOpen
  ];

  let updatePosition = () => {
    if (shouldUpdatePosition === false || !overlayRef.current || !triggerRef.current || !containerRef.current) {
      return;
    }

    setPosition(
      calculatePosition(
        placement,
        overlayRef.current,
        triggerRef.current,
        containerRef.current,
        containerPadding,
        shouldFlip,
        boundaryElement,
        offset,
        crossOffset
      )
    );
  };

  // Update position when anything changes
  useEffect(updatePosition, deps);

  // Update position on window resize
  useResize(updatePosition);

  return {
    overlayProps: {
      style: {
        position: 'absolute',
        zIndex: 100000, // should match the z-index in ModalTrigger
        left: position.positionLeft,
        top: position.positionTop,
        maxHeight: position.maxHeight
      }
    },
    placement: position.placement,
    arrowProps: {
      style: {
        left: position.arrowOffsetLeft,
        top: position.arrowOffsetTop
      }
    }
  };
}

function useResize(onResize) {
  useEffect(() => {
    window.addEventListener('resize', onResize, false);
    return () => {
      window.removeEventListener('resize', onResize, false);
    };
  }, [onResize]);
}