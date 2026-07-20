import { Button, Modal } from "@heroui/react";
import { AlertTriangleIcon, Trash2Icon, XIcon } from "lucide-react";

export function DeleteCharacterModal({
  characterName,
  isDeleting,
  isOpen,
  onConfirm,
  onOpenChange,
}: Readonly<{
  characterName: string;
  isDeleting: boolean;
  isOpen: boolean;
  onConfirm: () => void;
  onOpenChange: (isOpen: boolean) => void;
}>) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop className="bg-black/45" variant="blur">
        <Modal.Container placement="center" size="md">
          <Modal.Dialog className="relative overflow-hidden rounded-3xl border border-rpg-border bg-rpg-surface text-rpg-text shadow-2xl">
            <Modal.Header className="!flex !flex-row !items-start !justify-between gap-4 border-b border-rpg-border px-6 py-5 text-left">
              <div className="flex min-w-0 items-center gap-3">
                <Modal.Icon className="grid size-10 place-items-center rounded-2xl bg-rpg-danger text-white">
                  <AlertTriangleIcon className="h-5 w-5" />
                </Modal.Icon>
                <div className="min-w-0 text-left">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-rpg-muted">
                    Excluir ficha
                  </p>
                  <Modal.Heading className="text-xl font-black tracking-normal text-rpg-text">
                    Tem certeza?
                  </Modal.Heading>
                </div>
              </div>

              <Button
                aria-label="Fechar modal de exclusao"
                className="ml-auto grid size-9 shrink-0 place-items-center rounded-lg text-rpg-muted transition hover:bg-rpg-surface-muted hover:text-rpg-text"
                onPress={() => onOpenChange(false)}
                type="button"
                variant="secondary"
              >
                <XIcon className="h-5 w-5" />
              </Button>
            </Modal.Header>

            <Modal.Body className="grid gap-3 px-6 py-5">
              <p className="text-justify text-sm leading-6 text-rpg-muted">
                A ficha{" "}
                <strong className="text-rpg-text">{characterName}</strong> sera
                removida da campanha junto com seus dados e icone.
              </p>
              <p className="text-sm font-semibold text-rpg-danger">
                Essa acao nao pode ser desfeita.
              </p>
            </Modal.Body>

            <Modal.Footer className="flex justify-end gap-3 border-t border-rpg-border px-6 py-5">
              <Button
                className="rounded-lg border border-rpg-border px-4 py-2 text-sm font-bold text-rpg-muted transition hover:bg-rpg-surface-muted"
                onPress={() => onOpenChange(false)}
                type="button"
                variant="secondary"
              >
                Cancelar
              </Button>
              <Button
                className="flex items-center justify-center gap-2 rounded-lg bg-rpg-danger px-5 py-2 font-bold text-white shadow-lg shadow-rpg-danger/20 transition hover:brightness-95"
                isDisabled={isDeleting}
                onPress={onConfirm}
              >
                <Trash2Icon className="h-5 w-5" />
                {isDeleting ? "Excluindo..." : "Excluir ficha"}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
