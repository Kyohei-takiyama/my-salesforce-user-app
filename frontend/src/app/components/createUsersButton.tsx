interface CreateUsersButtonProps {
  onCreateUsers: () => void;
  disabled: boolean;
}

export default function CreateUsersButton({
  onCreateUsers,
  disabled,
}: CreateUsersButtonProps) {
  return (
    <button
      onClick={onCreateUsers}
      disabled={disabled}
      className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300 mt-4"
    >
      ユーザー作成実行
    </button>
  );
}
