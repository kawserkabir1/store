import SingleViewVendorRequest from '@/components/flash-sale/vendor-request/single-view-vendor-request';
import Layout from '@/components/layouts/admin';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useRequestedListForFlashSale } from '@/data/flash-sale-vendor-request';
import { useShopQuery } from '@/data/shop';
import { FlashSaleProductsRequest, FlashSale } from '@/types';
import { adminOnly, getAuthCredentials } from '@/utils/auth-utils';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useRequestedProductsForFlashSale } from '@/data/flash-sale-vendor-request';
import FlashSaleProductList from '@/components/flash-sale/flash-sale-product-list';
import { useCallback, useState } from 'react';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

const VendorRequestFlashSaleSinglePage = () => {
  const { query, locale } = useRouter();
  const { t } = useTranslation();
  const { permissions } = getAuthCredentials();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  // const { data: shopData } = useShopQuery({
  //   slug: query?.shop as string,
  // });

  const {
    flashSaleRequest: data,
    loading,
    error,
  } = useRequestedListForFlashSale({
    id: query?.id as string,
    language: locale as string,
    // shop_id: shopData?.id!,
  });

  const {
    products,
    loading: requestedProductsLoading,
    paginatorInfo,
    error: requestedProductsError,
  } = useRequestedProductsForFlashSale({
    limit: 5,
    vendor_request_id: query?.id as string,
    page,
    name: searchTerm,
  });

  const handleSearch = useCallback(
    ({ searchText }: { searchText: string }) => {
      setSearchTerm(searchText);
      setPage(1);
    },
    [setSearchTerm, setPage],
  );

  const handlePagination = useCallback(
    (current: any) => {
      setPage(current);
    },
    [setPage],
  );

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <>
      <SingleViewVendorRequest data={data as FlashSaleProductsRequest} />
      <div className="relative overflow-hidden bg-white mb-5">
        <FlashSaleProductList
          products={products}
          paginatorInfo={paginatorInfo}
          onPagination={handlePagination}
          handleSearch={handleSearch}
          type={data?.flash_sale?.type as FlashSale['type']}
          rate={data?.flash_sale?.rate as FlashSale['rate']}
        />
      </div>
    </>
  );
};

VendorRequestFlashSaleSinglePage.authenticate = {
  permissions: adminOnly,
};
VendorRequestFlashSaleSinglePage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'table'])),
  },
});

export default VendorRequestFlashSaleSinglePage;
