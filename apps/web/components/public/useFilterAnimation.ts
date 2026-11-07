'use client';

import { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react';

interface FilterAnimationOptions<T> {
  items: T[];
  filterFn: (item: T) => boolean;
  getItemId: (item: T) => string;
}

interface AnimatedItem<T> {
  data: T;
  id: string;
  isExiting: boolean;
  isEntering: boolean;
}

/**
 * Lightweight, zero-dependency FLIP (First, Last, Invert, Play) transition hook.
 * Handles bidirectional category filtering:
 * 1. Exit animation: fading & translateY(-8px) for leaving items (160ms).
 * 2. Layout repositioning: smooth gliding of surviving items to new grid/flex positions (300ms).
 * 3. Enter animation: smooth fade-in & translateY(10px -> 0) for arriving items (240ms).
 * 4. Respects prefers-reduced-motion: reduce.
 * 5. Handles rapid consecutive category clicks without layout snapping.
 */
export function useFilterAnimation<T>({
  items,
  filterFn,
  getItemId,
}: FilterAnimationOptions<T>) {
  // Elements reference map by item ID
  const itemElementsRef = useRef<Map<string, HTMLElement>>(new Map());
  // Stored bounding rects for FLIP
  const firstRectsRef = useRef<Map<string, DOMRect>>(new Map());
  // Pending transition timeout
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Guard to prevent re-triggering animations on initial component mount
  const isInitialMountRef = useRef(true);

  // Keep getItemId in a ref to avoid infinite dependency loops if passed inline
  const getItemIdRef = useRef(getItemId);
  getItemIdRef.current = getItemId;

  const currentFilterFnRef = useRef(filterFn);
  currentFilterFnRef.current = filterFn;

  const currentItemsRef = useRef(items);
  currentItemsRef.current = items;

  // Function to register an element ref
  const registerItemRef = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el) {
        itemElementsRef.current.set(id, el);
      } else {
        itemElementsRef.current.delete(id);
      }
    },
    []
  );

  // Initialize displayed items matching filter
  const [displayedItems, setDisplayedItems] = useState<AnimatedItem<T>[]>(() => {
    return items.filter(filterFn).map((data) => ({
      data,
      id: getItemId(data),
      isExiting: false,
      isEntering: false,
    }));
  });

  // Triggered whenever the filter changes
  useEffect(() => {
    // Skip on initial mount since useState already initialized matching items
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    const getId = (item: T) => getItemIdRef.current(item);

    // Check reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const nextMatching = currentItemsRef.current.filter(currentFilterFnRef.current);
    const nextMatchingIds = new Set(nextMatching.map(getId));

    if (prefersReducedMotion) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setDisplayedItems(
        nextMatching.map((data) => ({
          data,
          id: getId(data),
          isExiting: false,
          isEntering: false,
        }))
      );
      return;
    }

    // 1. FIRST: Capture bounding client rects of all currently visible elements
    const rects = new Map<string, DOMRect>();
    itemElementsRef.current.forEach((el, id) => {
      if (el && document.body.contains(el)) {
        rects.set(id, el.getBoundingClientRect());
      }
    });
    firstRectsRef.current = rects;

    // Clear any pending timeout from previous rapid click
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // 2. Mark exiting items that no longer match
    setDisplayedItems((prev) => {
      // Check if current items already match exactly
      const currentNonExiting = prev.filter((i) => !i.isExiting).map((i) => i.id);
      const isAlreadyIdentical =
        currentNonExiting.length === nextMatching.length &&
        currentNonExiting.every((id, idx) => id === getId(nextMatching[idx]));

      if (isAlreadyIdentical) {
        return prev;
      }

      const updated = prev.map((item) => {
        if (!nextMatchingIds.has(item.id)) {
          return { ...item, isExiting: true, isEntering: false };
        }
        return { ...item, isExiting: false };
      });

      // If no items are exiting, proceed directly to new layout
      const hasExiting = updated.some((item) => item.isExiting);
      if (!hasExiting) {
        const currentIds = new Set(prev.map((p) => p.id));
        return nextMatching.map((data) => {
          const id = getId(data);
          return {
            data,
            id,
            isExiting: false,
            isEntering: !currentIds.has(id),
          };
        });
      }

      return updated;
    });

    // 3. After exit transition (180ms), swap in the new matching set
    timeoutRef.current = setTimeout(() => {
      const intermediateRects = new Map<string, DOMRect>();
      itemElementsRef.current.forEach((el, id) => {
        if (el && document.body.contains(el) && nextMatchingIds.has(id)) {
          intermediateRects.set(id, el.getBoundingClientRect());
        }
      });
      if (intermediateRects.size > 0) {
        firstRectsRef.current = intermediateRects;
      }

      setDisplayedItems((prev) => {
        const prevIds = new Set(prev.filter((p) => !p.isExiting).map((p) => p.id));
        return nextMatching.map((data) => {
          const id = getId(data);
          return {
            data,
            id,
            isExiting: false,
            isEntering: !prevIds.has(id),
          };
        });
      });
    }, 180);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [filterFn, items]);

  // 4. FLIP Execution in useLayoutEffect when DOM updates
  useLayoutEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const firstRects = firstRectsRef.current;
    if (!firstRects || firstRects.size === 0) return;

    displayedItems.forEach((item, index) => {
      const el = itemElementsRef.current.get(item.id);
      if (!el) return;

      const firstRect = firstRects.get(item.id);

      if (item.isEntering) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(10px)';
        el.style.transition = 'none';

        const staggerDelay = Math.min(index * 25, 120);

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.style.transition = `opacity 240ms ease-out ${staggerDelay}ms, transform 240ms cubic-bezier(0.16, 1, 0.3, 1) ${staggerDelay}ms`;
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          });
        });
      } else if (!item.isExiting && firstRect) {
        const lastRect = el.getBoundingClientRect();
        const deltaX = firstRect.left - lastRect.left;
        const deltaY = firstRect.top - lastRect.top;

        if (Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5) {
          el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
          el.style.transition = 'none';

          void el.offsetHeight;

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              el.style.transition =
                'transform 300ms cubic-bezier(0.2, 0, 0, 1)';
              el.style.transform = 'translate(0, 0)';
            });
          });
        }
      }
    });

    firstRectsRef.current = new Map();
  }, [displayedItems]);

  return {
    displayedItems,
    registerItemRef,
  };
}
