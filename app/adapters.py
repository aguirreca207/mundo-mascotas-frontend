from allauth.account.adapter import DefaultAccountAdapter


class MundoMascotasAccountAdapter(DefaultAccountAdapter):
    def add_message(
        self,
        request,
        level,
        message_template=None,
        message_context=None,
        extra_tags="",
        message=None,
    ):
        if message_template and message_template.endswith("logged_in.txt"):
            return

        if message and "Successfully signed in as" in message:
            return

        super().add_message(
            request,
            level,
            message_template=message_template,
            message_context=message_context,
            extra_tags=extra_tags,
            message=message,
        )
