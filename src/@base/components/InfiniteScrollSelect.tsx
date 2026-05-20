import FloatSelect from '@base/antd/components/FloatSelect';
import { IBaseResponse } from '@base/interfaces';
import { Toolbox } from '@lib/utils';
import { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';
import { Select, Spin, type SelectProps } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { useCallback, useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';

interface IProps<D = any> extends SelectProps {
  isFloat?: boolean;
  initialOptions?: D[];
  option: (props: { idx: number; item: D }) => DefaultOptionType;
  onChangeSearchTerm: (searchTerm: string) => void;
  onChangeItems?: (items: D[]) => void;
  query: UseInfiniteQueryResult<InfiniteData<IBaseResponse<D[]>>, Error>;
}

const InfiniteScrollSelect = <D = any,>({
  isFloat = false,
  initialOptions = [],
  option,
  onChangeSearchTerm,
  onChangeItems,
  query,
  ...rest
}: IProps<D>) => {
  const { ref, inView } = useInView();

  const mergeItems = useCallback(() => {
    if (!query.data?.pages) return [];
    return query.data.pages.flatMap((page) => page?.data ?? []);
  }, [query.data]);

  const items = useMemo(() => {
    const sanitizedMergeItems = [
      ...initialOptions,
      ...mergeItems().filter((option: any) => !initialOptions.some((x: any) => x.id === option.id)),
    ];
    onChangeItems?.(sanitizedMergeItems);
    return sanitizedMergeItems;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOptions, mergeItems]);

  useEffect(() => {
    if (inView && !query.isFetchingNextPage) query.fetchNextPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  if (isFloat) {
    return (
      <FloatSelect
        {...rest}
        filterOption={false}
        onSearch={Toolbox.debounce(onChangeSearchTerm, 1000)}
        onBlur={() => onChangeSearchTerm(null)}
        onSelect={(...e) => {
          rest.onSelect?.(...e);

          if (!rest.mode) {
            onChangeSearchTerm(null);
          }
        }}
        loading={query.isLoading}
        options={Toolbox.toCleanArray([
          ...items.map((item, idx) => option({ idx, item })),
          query.hasNextPage
            ? {
                key: 'loading',
                label: (
                  <div className="text-center" ref={ref}>
                    <Spin />
                  </div>
                ),
                value: 'loading',
                disabled: true,
              }
            : null,
        ])}
      />
    );
  }

  return (
    <Select
      {...rest}
      filterOption={false}
      onSearch={Toolbox.debounce(onChangeSearchTerm, 1000)}
      onBlur={() => onChangeSearchTerm(null)}
      onSelect={(...e) => {
        rest.onSelect?.(...e);

        if (!rest.mode) {
          onChangeSearchTerm(null);
        }
      }}
      loading={query.isLoading}
      options={Toolbox.toCleanArray([
        ...items.map((item, idx) => option({ idx, item })),
        query.hasNextPage
          ? {
              key: 'loading',
              label: (
                <div className="text-center" ref={ref}>
                  <Spin />
                </div>
              ),
              value: 'loading',
              disabled: true,
            }
          : null,
      ])}
    />
  );
};

export default InfiniteScrollSelect;
