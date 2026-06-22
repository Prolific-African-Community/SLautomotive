import type { GetServerSideProps } from "next";
import { verifySessionFromRequest } from "../../lib/simple-auth";

export default function DashboardIndex() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = verifySessionFromRequest(context.req);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    redirect: {
      destination: "/dashboard/garage",
      permanent: false,
    },
  };
};
